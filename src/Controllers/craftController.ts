import { formatDBParamsToStr, generateCraftableImageUrl, generateNftUri, getAddressNftDetails, getAdminAccount, getPlayerPublicKey, getRPCEndpoint } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import * as craftableController from './craftableController';
import * as craftingUuidController from './craftingUuidController';
import * as nftMetadataController from './nftMetadataController';
import { v4 as uuidv4 } from 'uuid';
import { fillableColumns } from "../Models/craft";
import { WrapperConnection } from "../ReadAPI";
import { PublicKey } from "@metaplex-foundation/js";
import { mintNft } from "../NFT/Minter";
import { CRAFTABLE_COLLECTION, CRAFTABLE_SYMBOL } from "../Constants";
import { MetaplexStandard } from "../NFT/Minter/types";
import { createTransferCompressedNftInstruction } from "../NFT/Transfer";

export type PreCraftParams = {
    craftable_id: number;
    nft_ids: string[];
    account: string;
    isPublicKey: boolean;
}

export type NewCraftParams = {
    uuid: string;
}

const table = 'crafts';

// init entry for user
export const init = async() => { }

export const preCraft = async({craftable_id, nft_ids, account, isPublicKey}: PreCraftParams) => {
    if(!nft_ids || nft_ids.length === 0) {
        return "Error: Missing NFT Ids";
    }
    // check materials needed
    let craftables = await craftableController.find({ id: craftable_id });
    if(craftables.length === 0) {
        return "Error: Unable to find craftable";
    }
    
    let requirements: { [name: string]: number} = {};
    craftables.forEach(x => {
        if(!x.requirements) {
            return;
        }

        x.requirements.forEach(r => {
            if(!requirements[r.name]) {
                requirements[r.name] = 0;
            }

            // get all names
            requirements[r.name] += r.value;
        })
    });

    // if materials and nft ids belongs to the public key
    let address = getPlayerPublicKey(isPublicKey, account);
    let addressNftDetails = await getAddressNftDetails(isPublicKey, account);

    for(const [index, id] of nft_ids.entries()) {
        let loot = addressNftDetails.loot.filter(x => x.raw.id === id);
        if(loot.length === 0) {
            return "Error: Address do not posses nft";
        }

        let lootName = loot[0].metadata.name;

        if(!requirements[lootName] && requirements[lootName] !== 0) {
            return "Error: Loot not required";
        }

        // check if address is sending more than enough loots
        requirements[lootName]--;
        if(requirements[lootName] < 0) {
            return "Error: More than enough loot supplied";
        }
    }

    // check if enough loot is supplied
    for(const [key, value] of Object.entries(requirements)) {
        if(value > 0) {
            return "Error: Less than enough loot supplied";
        }
    }

    // verified at this stage
    // create uuid and insert multiple columns regarding the nft ids
    let uuid = uuidv4();
    await craftingUuidController.create({ uuid, craftable_id, address: address.toBase58() , nft_id: JSON.stringify(nft_ids) });
    
    let adminPublicKey = getAdminAccount().publicKey;
    let txParams = await Promise.all(
        nft_ids.map(id => createTransferCompressedNftInstruction(adminPublicKey, new PublicKey(id)))
    );
    
    // let tx = new Transaction().add(...txs);
    return {uuid, adminPublicKey: adminPublicKey.toBase58(), txParams};
}

export const newCraft = async({ uuid }: NewCraftParams) => {
    // check if nfts had been transferred to our public key
    let craftingUuid = await craftingUuidController.find({ uuid });
    if(craftingUuid.length === 0){
        return "Error: Unable to find uuid";
    }

    let nftIds: string[] = [];
    try {
        nftIds = JSON.parse(craftingUuid[0].nft_id);
    }

    catch(e) {
        return "Error: Corrupted uuid";
    }

    const CLUSTER_URL = getRPCEndpoint();
    let connection = new WrapperConnection(CLUSTER_URL, "confirmed");
    let res = await Promise.all(
        nftIds.map(x => connection.getAsset(new PublicKey(x)))
    );

    let adminPublicKey = getAdminAccount().publicKey.toBase58();

    // if use shift, check if burned
    for(const [index, asset] of res.entries()) {
        if(asset.ownership.owner !== adminPublicKey) {
            return "Error: Loot not transferred to the designated address";
        }
    }

    let craftable = await craftableController.view(craftingUuid[0].craftable_id);
    if(!craftable) {
        return "Error: Unable to find craft";
    }

    let {uri, uuid: craftableUuid} = generateNftUri();
    let craftableMetadata: MetaplexStandard = {
        name: craftable.name,
        symbol: CRAFTABLE_SYMBOL,
        description: "It's a fine craft!",
        image: generateCraftableImageUrl(craftable.img_file),
        attributes: [
            {
                trait_type: "type",
                value: "craft"
            },
        ]
    };

    let insertCraftableMetadataParams = {
        uuid: craftableUuid,
        metadata: JSON.stringify(craftableMetadata),
    }

    mintNft({
        mintTo: new PublicKey(craftingUuid[0].address),
        whichCollection: CRAFTABLE_COLLECTION,
        name: craftable.name,
        symbol: CRAFTABLE_SYMBOL,
        uri,
    })

    await nftMetadataController.create(insertCraftableMetadataParams);

    // verified
    // delete entries
    await craftingUuidController.deleteAll(uuid);

    return "Success!";
}


export const errorCraft = async({ uuid }: { uuid: string }) => {
    // transaction failed, delete all entries
    await craftingUuidController.deleteAll(uuid);
    return 1;
}

// create
export const create = async(insertParams: any): Promise<{[id: string]: number}> => {
    const filtered = _.pick(insertParams, fillableColumns);
    const params = formatDBParamsToStr(filtered, ', ', true);

    // put quote
    const insertColumns = Object.keys(filtered);

    const query = `INSERT INTO ${table} (${_.join(insertColumns, ', ')}) VALUES (${params}) RETURNING id`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult(query);

    return result;
}

// view (single - id)
export const view = async(id: number): Promise<any> => {
    const query = `SELECT ${fillableColumns.join(",")} FROM ${table} WHERE id = ${id} LIMIT 1`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult(query);

    return result ?? {};
}

// find (all match)
export const find = async(whereParams: {[key: string]: any}): Promise<any[]> => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    const result = await db.executeQueryForResults(query);

    return result as any[] ?? [];
}

// list (all)
export const list = async(): Promise<any[]> => {
    const query = `SELECT * FROM ${table}`;

    const db = new DB();
    const result = await db.executeQueryForResults(query);

    return result as any[] ?? [];
}

// update
export const update = async(id: number, updateParams: {[key: string]: any}): Promise<void> => {
    // filter
    const filtered = _.pick(updateParams, fillableColumns);
    const params = formatDBParamsToStr(filtered, ', ');

    const query = `UPDATE ${table} SET ${params} WHERE id = ${id}`;

    const db = new DB();
    await db.executeQueryForSingleResult(query);
}

// delete (soft delete?)
// export const delete = async(userId: number) => {
//     const query = `DELETE FROM ${table} WHERE user_id = ${userId}`;

//     const db = new DB();
//     await db.executeQueryForSingleResult(query);

//     return result;
// }

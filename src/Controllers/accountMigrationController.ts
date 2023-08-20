import { clawbackSOLFrom, formatDBParamsToStr, getAddressNftDetails, getPlayerPublicKey, sendSOLTo, transferCNfts } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import { AccountMigration, fillableColumns } from "../Models/accountMigration";
import { TipLink } from '@tiplink/api';
import { transferAllTo } from '../../src/Token';
import { PublicKey } from "@solana/web3.js";

const table = 'account_migrations';

// init entry for user
export const init = async() => { }

export const clawback = async(account: string ) => {
    await clawbackSOLFrom(account);
    return true;
}

export const migrate = async(account: string) => {
    const details = await getAddressNftDetails(false, account);
    const nftIds = [
        ...details.monster.map(x => x.raw.id),
        ...details.loot.map(x => x.raw.id),
        ...details.craftable.map(x => x.raw.id),
    ];

    // generate tiplink
    const tiplink = await TipLink.create();
    const tiplinkPubKey = tiplink.keypair.publicKey.toBase58();
    const tiplinkUrl = tiplink.url.toString();

    if(!PublicKey.isOnCurve(tiplinkPubKey)) {
        throw Error("Invalid tiplink key");
    }

    await create({ account, migration_link: tiplinkUrl });
    await sendSOLTo(false, account, 0.01);
    await transferCNfts(nftIds, account, tiplinkPubKey);

    // transfer all tokens
    await transferAllTo(account, tiplink.keypair.publicKey);

    setTimeout(async () => {
        await clawbackSOLFrom(account);
    }, 2000);

    return tiplinkUrl;
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
export const find = async(whereParams: {[key: string]: any}) => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    const result = await db.executeQueryForResults<AccountMigration>(query);

    return result;
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

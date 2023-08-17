import { Router } from 'express';
import { getCraftableCollectionAddress, getLootCollectionAddress, getMonsterCollectionAddress, getRPCEndpoint } from '../../utils';
import { WrapperConnection } from '../ReadAPI';
import { PublicKey } from '@solana/web3.js';
import { loadKeypairFromFile } from '../Helpers';
import { getTokenPublicKey, getUserTokens } from '../Token';
import { OnchainNFTDetails } from './onchain.d';
import * as nftMetadataController from '../Controllers/nftMetadataController';
import { MetaplexStandard } from '../NFT/Minter/types';
import { ReadApiAsset } from '@metaplex-foundation/js';

export const routes = Router();

// token in account
routes.post('/tokens', async(req, res) => {
    let data = req.body;

    if(data.isPublicKey === null || data.isPublicKey === undefined || !data.account) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {

        // load the env variables and store the cluster RPC url
        const CLUSTER_URL = getRPCEndpoint();
    
        // create a new rpc connection, using the ReadApi wrapper
        const connection = new WrapperConnection(CLUSTER_URL, "confirmed");
        let { isPublicKey, account } = data;
        let publicKey = isPublicKey? new PublicKey(account) : loadKeypairFromFile(account).publicKey;
        let result = await getUserTokens(publicKey);

        let goldMintAddress = getTokenPublicKey("gold");
        let expMintAddress = getTokenPublicKey("exp");

        let ret: { gold: number, exp: number} = {
            gold: result[goldMintAddress] ?? 0,
            exp: result[expMintAddress] ?? 0,
        };

        
        return res.json({ success: true, data: ret });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

// nft assets in account
routes.post('/nfts', async(req, res) => {
    const getNftDetails = async(rawDetails: ReadApiAsset[]) => {
        let ret = [];
        for(const [key, raw] of Object.entries(rawDetails)) {
            // invalid uri
            if(!raw.content.json_uri.includes("/metadata/")) {
                continue;
            }

            let exploded = raw.content.json_uri.split("/");

            // invalid uri
            if(exploded.length === 0) {
                continue;
            }

            let jsonFile = exploded[exploded.length - 1];
            let uuid = jsonFile.replace(".json", "");

            let metadataStrings = await nftMetadataController.find({ uuid });
            if(metadataStrings.length === 0) {
                continue;
            }

            let metadata = JSON.parse(metadataStrings[0].metadata) as MetaplexStandard;

            let types = metadata.attributes.filter(x => x.trait_type === "type");

            // invalid metadata
            if(types.length === 0) {
                continue;
            }
            
            ret.push({
                raw,
                metadata
            });
        };
        return ret;
    }
    let data = req.body;

    if(data.isPublicKey === null || data.isPublicKey === undefined || !data.account) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {
        // load the env variables and store the cluster RPC url
        const CLUSTER_URL = getRPCEndpoint();
    
        // create a new rpc connection, using the ReadApi wrapper
        const connection = new WrapperConnection(CLUSTER_URL, "confirmed");
        let { isPublicKey, account } = data;
        let publicKey = isPublicKey? new PublicKey(account) : loadKeypairFromFile(account).publicKey;
        const result = await connection.getAssetsByOwner({ ownerAddress: publicKey.toBase58() });

        let rawMonsters = result.items.filter(x => x.grouping[0].group_value === getMonsterCollectionAddress());
        let rawLoots = result.items.filter(x => x.grouping[0].group_value === getLootCollectionAddress());
        let rawCraftables = result.items.filter(x => x.grouping[0].group_value === getCraftableCollectionAddress());

        let ret: { [key: string]: OnchainNFTDetails[] } = {};
        ret.monster = await getNftDetails(rawMonsters);
        ret.loot = await getNftDetails(rawLoots);
        ret.craftable = await getNftDetails(rawCraftables);

        return res.json({ success: true, data: ret });
    }

    catch (e){
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

// nft assets in account
routes.post('/getTokenMetadata', async(req, res) => {
    let data = req.body;

    if(!data.tokenIds) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {
        return res.json({ success: true, data: [] });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});
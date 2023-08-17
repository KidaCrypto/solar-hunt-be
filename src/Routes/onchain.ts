import { Router } from 'express';
import { getCollectionAddress, getCraftableCollectionAddress, getLootCollectionAddress, getMonsterCollectionAddress, getRPCEndpoint } from '../../utils';
import { WrapperConnection } from '../ReadAPI';
import { PublicKey } from '@solana/web3.js';
import { loadKeypairFromFile } from '../Helpers';
import { getTokenPublicKey, getUserTokens } from '../Token';
import { OnchainNFTDetails } from './onchain.d';
import * as nftMetadataController from '../Controllers/nftMetadataController';
import { MetaplexStandard } from '../NFT/Minter/types';

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

        let rawSolarNfts = result.items.filter(x => x.grouping[0].group_value === getCollectionAddress());
        // let rawLoots = result.items.filter(x => x.grouping[0].group_value === getLootCollectionAddress());
        // let rawCraftables = result.items.filter(x => x.grouping[0].group_value === getCraftableCollectionAddress());

        let ret: { [key: string]: OnchainNFTDetails[] } = {};

        for(const [key, raw] of Object.entries(rawSolarNfts)) {
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
            console.log(metadata)
            let types = metadata.attributes.filter(x => x.trait_type === "type");

            // invalid metadata
            if(types.length === 0) {
                continue;
            }
            
            let type = types[0].value;
            if(!ret[type]) {
                ret[type] = [];
            }

            ret[type].push({
                raw,
                metadata
            });
        };

        console.log('leaving')
        console.log(ret);

        return res.json({ success: true, data: ret });
    }

    catch {
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
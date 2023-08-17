import { Router } from 'express';
import { getAddressNftDetails, getCraftableCollectionAddress, getLootCollectionAddress, getMonsterCollectionAddress, getPlayerPublicKey, getRPCEndpoint } from '../../utils';
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
        let publicKey =  getPlayerPublicKey(isPublicKey, account);
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
        let { isPublicKey, account } = data;
        let ret = await getAddressNftDetails(isPublicKey, account);
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
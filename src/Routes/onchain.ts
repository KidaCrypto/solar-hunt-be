import { Router } from 'express';
import { getRPCEndpoint } from '../../utils';
import { WrapperConnection } from '../ReadAPI';
import { PublicKey } from '@solana/web3.js';
import { loadKeypairFromFile } from '../Helpers';
import { getTokenPublicKey, getUserTokens } from '../Token';

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
        return res.json({ success: true, data: result.items });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});
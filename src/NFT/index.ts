import { Connection } from "@solana/web3.js";
import { getAdminAccount, getRPCEndpoint } from "../../utils";
import { Metaplex, UploadMetadataInput, bundlrStorage, keypairIdentity } from "@metaplex-foundation/js";



const endpoint = getRPCEndpoint(); //Replace with your RPC Endpoint
const connection = new Connection(endpoint);

const account = getAdminAccount();
const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(account))
    .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: endpoint,
        timeout: 60000,
    }));

const MINT_CONFIG = {
    numDecimals: 6,
    numberTokens: 1337
}

const MY_TOKEN_METADATA: UploadMetadataInput = {
    name: "Test Token",
    symbol: "TEST",
    description: "This is a test token!",
    image: "https://URL_TO_YOUR_IMAGE.png" //add public URL to image you'd like to use
}

const createColletionNft = async() => {
    const { nft: collectionNft } = await metaplex.nfts().create({
        name: "test nft",
        uri: "to_do",
        sellerFeeBasisPoints: 0,
        isCollection: true,
        updateAuthority: account,
        // mintAuthority: account,
    });

    console.log(`Minted Collection: ${collectionNft.address.toString()}`);
}
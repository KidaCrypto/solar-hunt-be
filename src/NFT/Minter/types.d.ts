import { PublicKey } from "@solana/web3.js";

export type NftMintDetails = {
    mintTo: PublicKey;
    whichCollection: string; // load which keypair
    name: string;
    symbol: string;
    uri: string;
}
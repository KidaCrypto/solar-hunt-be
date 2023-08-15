import { PublicKey } from "@solana/web3.js";

export type NftMintDetails = {
    mintTo: PublicKey;
    name: string;
    symbol: string;
    uri: string;
}
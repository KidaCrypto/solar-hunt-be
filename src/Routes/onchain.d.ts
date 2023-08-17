import { ReadApiAsset } from "@metaplex-foundation/js"
import { MetaplexStandard } from "../NFT/Minter/types";

export type OnchainNFTDetails = {
    raw: ReadApiAsset;
    metadata: MetaplexStandard;
}
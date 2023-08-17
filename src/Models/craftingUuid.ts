export type CraftingUuid = {
    id: number;
    uuid: string;
    craftable_id: number;
    address: string;
    nft_id: string; // JSON string array
}

export const fillableColumns = [
    'uuid',
    'craftable_id',
    'address',
    'nft_id',
];
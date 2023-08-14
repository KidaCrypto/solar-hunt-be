export type Craft = {
    id: number;
    address: string;
    craftable_id: string;
    created_at: string;
}

export const fillableColumns = [
    'address',
    'craftable_id',
    'created_at',
];
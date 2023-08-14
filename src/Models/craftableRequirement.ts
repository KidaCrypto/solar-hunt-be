export type CraftableRequirement = {
    id: number;
    craftable_id: number;
    loot_id: number;
    value: number;
}

export const fillableColumns = [
    'craftable_id',
    'loot_id',
    'value',
];
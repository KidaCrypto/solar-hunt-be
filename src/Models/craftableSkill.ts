export type CraftableSkill = {
    id: number;
    craftable_id: number;
    name: string;
    value: number;
}

export const fillableColumns = [
    'craftable_id',
    'name',
    'value',
];
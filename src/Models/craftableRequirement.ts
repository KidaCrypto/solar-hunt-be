import { MonsterLoot } from "./loot";

export type CraftableRequirement = {
    id: number;
    craftable_id: number;
    loot_id: number;
    value: number;
    loot?: MonsterLoot[];
}

export type CraftableRequirementByName = {
    craftable_id: number;
    name: string;
    img_file: string;
    value: number;
}

export const fillableColumns = [
    'craftable_id',
    'loot_id',
    'value',
];
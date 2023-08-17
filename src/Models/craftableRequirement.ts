import { MonsterLoot } from "./loot";

export type CraftableRequirement = {
    id: number;
    craftable_id: number;
    loot_id: number;
    value: number;
    loot?: MonsterLoot[];
}

export const fillableColumns = [
    'craftable_id',
    'loot_id',
    'value',
];
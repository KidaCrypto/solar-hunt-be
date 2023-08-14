export type MonsterLoot = {
    id: number;
    name: string;
    img_file: string;
    monster_id: number;
    loot_chance: number;
}

export const fillableColumns = [
    'name',
    'img_file',
    'monster_id',
    'loot_chance',
];
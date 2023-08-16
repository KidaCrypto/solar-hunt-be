import { HuntLoot } from "./huntLoot";
import { Monster } from "./monster";

export type Hunt = {
    id: number;
    address: string;
    monster_id: number;
    caught: boolean;
    gold: number;
    exp: number;
    is_shiny: boolean;
    created_at: string;

    monster: Monster;
    hunt_loots: HuntLoot[];
}

export const fillableColumns = [
    'address',
    'monster_id',
    'caught',
    'gold',
    'exp',
    'is_shiny',
];
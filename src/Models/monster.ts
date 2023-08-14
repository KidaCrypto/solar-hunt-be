export type Monster = {
    id: number;
    name: string;
    img_file: string;
    shiny_img_file: string;
    shiny_chance: number;
    base_gold: number;
    max_gold: number;
    base_exp: number;
    max_exp: number;
    catch_rate: number;
    shiny_catch_rate: number;
}

export const fillableColumns = [
    'name',
    'img_file',
    'shiny_img_file',
    'shiny_chance',
    'base_gold',
    'max_gold',
    'base_exp',
    'max_exp',
    'catch_rate',
    'shiny_catch_rate',
];
import monsterFile from '../../assets/sprites/_monster_sprite_files.json';
import effectFile from '../../assets/effects/_effect_files.json';
import skillIconsFile from '../../assets/skills/_skill_icon_files.json';
import DB from '../DB';

import { getInsertQuery, getRandomNumber } from '../../utils';
import _ from 'lodash';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '.env')});

//monsters
const MIN_GOLD = 30;
const MAX_BASE_GOLD = 100;
const MAX_GOLD = 200;
const MIN_EXP = 1;
const MAX_BASE_EXP = 50;
const MAX_EXP = 200;
const MIN_CATCHRATE = 50;
const MAX_CATCHRATE = 90;
const MIN_SHINY_CATCHRATE = 10;
const MAX_SHINY_CATCHRATE = 30;

//skills
const MIN_LOOT_CHANCE = 50;
const MAX_LOOT_CHANCE = 100;
const MIN_SKILL_VALUE = 0.01;
const MAX_SKILL_VALUE = 1;
const MIN_LOOT_REQUIREMENT = 1;
const MAX_LOOT_REQUIREMENT = 10;
const MIN_UNIQUE_LOOT_REQUIREMENT = 1;
const MAX_UNIQUE_LOOT_REQUIREMENT = 4;

export const seedMonsters = async() => {
    let db = new DB();
    let table = 'monsters';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns = [
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

    let values: any[][] = [];
    let nMonsters = monsterFile.file_names.length;

    for(let elementId = 1; elementId <= 4; elementId++) {
        for(let i = 0; i < nMonsters; i++) {
            let {name, file} = monsterFile.file_names[i];

            //currently unused
            let shinyImageFile = file.replace(".png", "_shiny.png");
            let shinyChance = getRandomNumber(0, 5); //5% chance max
            let baseGold = getRandomNumber(MIN_GOLD, MAX_BASE_GOLD);
            let maxGold = getRandomNumber(MAX_BASE_GOLD, MAX_GOLD);
            let baseExp = getRandomNumber(MIN_EXP, MAX_BASE_EXP);
            let maxExp = getRandomNumber(MAX_BASE_EXP, MAX_EXP);
            let baseCatchRate = getRandomNumber(MIN_CATCHRATE, MAX_CATCHRATE);
            let maxCatchRate = getRandomNumber(MIN_SHINY_CATCHRATE, MAX_SHINY_CATCHRATE);

            values.push([
                name,
                file,
                shinyImageFile,
                shinyChance,
                baseGold,
                maxGold,
                baseExp,
                maxExp,
                baseCatchRate,
                maxCatchRate,
            ]);
        }
    }

    let query = getInsertQuery(columns, values, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedMonsterLoots = async() => {
    let db = new DB();
    let table = 'monster_loots';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns = ['name', 'img_file', 'monster_id', 'loot_chance'];
    let values: any[][] = [];
    let nEffects = Math.floor(effectFile.file_names.length / 2); // we only use half of the effects as craftables
    let nMonsters = monsterFile.file_names.length;

    for(let i = 0; i < nEffects; i++) {
        let skillName = effectFile.file_names[i].name;

        let monsterIds: number[] = [];
        for(let j = 0; j < 10; j++) {
            //push to 10 monsters
            let lootChance = getRandomNumber(MIN_LOOT_CHANCE, MAX_LOOT_CHANCE, true);
    
            let monsterId = getRandomNumber(1, nMonsters, true);

            if(monsterIds.includes(monsterId)) {
                continue;
            }

            let iconFileIndex = getRandomNumber(0, skillIconsFile.file_names.length - 1, true);
            let iconFile = skillIconsFile.file_names[iconFileIndex];
    
            values.push([skillName, iconFile, monsterId, lootChance]);
            monsterIds.push(monsterId);
        }
    }

    let query = getInsertQuery(columns, values, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedCraftables = async() => {
    let db = new DB();
    let table = 'craftables';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let columns = ['name', 'img_file'];
    let values: any[][] = [];
    let nEffects = Math.floor(effectFile.file_names.length / 2); // we only use half of the effects as craftables

    for(let i = nEffects; i < nEffects * 2; i++) {
        let craftableName = effectFile.file_names[i].name;
        let iconFileIndex = getRandomNumber(0, skillIconsFile.file_names.length - 1, true);
        let iconFile = skillIconsFile.file_names[iconFileIndex];

        values.push([craftableName, iconFile]);
    }

    let query = getInsertQuery(columns, values, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedCraftableSkills = async() => {
    let db = new DB();
    let table = 'craftable_skills';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let craftableCounterQuery = `SELECT COUNT(*) as count FROM craftables`;
    let craftableCounterRes = await db.executeQueryForResults<{count: number}>(craftableCounterQuery);

    if(!craftableCounterRes || craftableCounterRes[0].count === 0) {
        console.log(`No craftables detected! Skipping..`);
        return;
    }

    let columns = ['craftable_id', 'name', 'value'];
    let values: any[][] = [];
    let craftableCount = craftableCounterRes[0].count;
    let skillNames = ['increase_loot_drop', 'increase_catch_rate', 'increase_exp_rate', 'increase_gold_rate'];

    for(let i = 0; i < craftableCount; i++) {
        let craftableId = i + 1; // reference current craftable

        let abilityCount = getRandomNumber(1, skillNames.length, true);

        for(let j = 0; j < abilityCount; j++) {
            let skillIndex = getRandomNumber(0, skillNames.length - 1, true);
            let skillName = skillNames[skillIndex]; // can have multiple same abilities
            let value = getRandomNumber(MIN_SKILL_VALUE, MAX_SKILL_VALUE);
            values.push([craftableId, skillName, value]);
        }
    }

    let query = getInsertQuery(columns, values, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}

export const seedCraftableRequirements = async() => {
    let db = new DB();
    let table = 'craftable_requirements';
    let checkerQuery = `SELECT COUNT(*) as count FROM ${table}`;
    let checkerRes = await db.executeQueryForResults<{count: number}>(checkerQuery);

    if(checkerRes && checkerRes[0].count > 0) {
        console.log(`${table} already seeded! Skipping..`);
        return;
    }

    let craftableCounterQuery = `SELECT COUNT(*) as count FROM craftables`;
    let craftableCounterRes = await db.executeQueryForResults<{count: number}>(craftableCounterQuery);

    if(!craftableCounterRes || craftableCounterRes[0].count === 0) {
        console.log(`No craftables detected! Skipping..`);
        return;
    }

    let lootCounterQuery = `SELECT COUNT(*) as count FROM monster_loots`;
    let lootCounterQueryRes = await db.executeQueryForResults<{count: number}>(lootCounterQuery);

    if(!lootCounterQueryRes || lootCounterQueryRes[0].count === 0) {
        console.log(`No craftables detected! Skipping..`);
        return;
    }

    let columns = ['craftable_id', 'loot_id', 'value'];
    let values: any[][] = [];
    let craftableCount = craftableCounterRes[0].count;
    let lootCount = Number(lootCounterQueryRes[0].count);

    for(let i = 0; i < craftableCount; i++) {
        let craftableId = i + 1; // reference current craftable
        let uniqueLootRequirement = getRandomNumber(MIN_UNIQUE_LOOT_REQUIREMENT, MAX_UNIQUE_LOOT_REQUIREMENT, true);
        let currentLootRequirements: number[] = [];

        for(let j = 0; j < uniqueLootRequirement; j++) {
            let lootId = getRandomNumber(1, lootCount, true);
            let lootAmount = getRandomNumber(MIN_LOOT_REQUIREMENT, MAX_LOOT_REQUIREMENT, true);

            if(currentLootRequirements.includes(lootId)) {
                continue;
            }
            
            values.push([craftableId, lootId, lootAmount]);
        }
    }

    let query = getInsertQuery(columns, values, table);
    try {
        await db.executeQuery(query);
        console.log(`Seeded ${table}`);
        return true;
    }

    catch (e){
        console.log(e);
        return false;
    }
}
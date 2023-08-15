import { formatDBParamsToStr, getRandomChance, getRandomNumber } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import * as monsterController from './monsterController';
import * as lootController from './lootController';
import * as huntLootController from './huntLootController';
import { fillableColumns } from '../Models/hunt';
import { PublicKey } from "@metaplex-foundation/js";
import { loadKeypairFromFile } from "../Helpers";
import { mintNft } from "../NFT/Minter";
import { LOOT_COLLECTION, LOOT_SYMBOL, MONSTER_COLLECTION, MONSTER_SYMBOL } from "../Constants";

const table = 'hunts';

export type InitiateHuntParams = {
    account: string; // email or public key
    isPublicKey: boolean;
}

// init entry for user
export const newHunt = async({ account, isPublicKey }: InitiateHuntParams) => { 
    let publicKey = isPublicKey? new PublicKey(account) : loadKeypairFromFile(account).publicKey;
    let monster = await monsterController.random();

    let shinyRoll = getRandomChance();
    let isShiny = shinyRoll <= monster.shiny_chance;

    let catchRoll = getRandomChance();
    let catchChance = isShiny? monster.shiny_catch_rate : monster.catch_rate;
    let caught = catchRoll <= catchChance;

    let huntStats = {
        address: publicKey.toBase58(),
        monster_id: monster.id,
        caught: false,
        gold: 0,
        exp: 0,
        is_shiny: isShiny,
    };
    
    if(!caught) {
        await create(huntStats);
        return 0;
    }

    huntStats.gold = getRandomNumber(monster.base_gold, monster.max_gold);
    huntStats.exp = getRandomNumber(monster.base_exp, monster.max_exp);

    // log hunting stats
    let hunt_id = await create(huntStats);

    // mint monster to address
    await mintNft({
        mintTo: publicKey,
        whichCollection: MONSTER_COLLECTION,
        name: monster.name,
        symbol: MONSTER_SYMBOL,
        uri: "todo",
    });

    let loots = await lootController.find({'monster_id': monster.id});
    for(const loot of loots) {
        let lootRoll = getRandomChance();
        let shouldMint = lootRoll <= loot.loot_chance;
        if(!shouldMint) {
            continue;
        }

        // log hunting loot
        await huntLootController.create({ hunt_id, loot_id: loot.id });

        // mint hunting loot to address
        await mintNft({
            mintTo: publicKey,
            whichCollection: LOOT_COLLECTION,
            name: loot.name,
            symbol: LOOT_SYMBOL,
            uri: "todo",
        });
    }

    // await mintTokens();
    return 1;
}

// create
export const create = async(insertParams: any): Promise<{[id: string]: number}> => {
    const filtered = _.pick(insertParams, fillableColumns);
    const params = formatDBParamsToStr(filtered, ', ', true);

    // put quote
    const insertColumns = Object.keys(filtered);

    const query = `INSERT INTO ${table} (${_.join(insertColumns, ', ')}) VALUES (${params}) RETURNING id`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult(query);

    return result;
}

// view (single - id)
export const view = async(id: number): Promise<any> => {
    const query = `SELECT ${fillableColumns.join(",")} FROM ${table} WHERE id = ${id} LIMIT 1`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult(query);
    result.monster = await monsterController.find({ "monster_id": result.monster_id });

    return result ?? {};
}

// find (all match)
export const find = async(whereParams: {[key: string]: any}): Promise<any[]> => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    let result = await db.executeQueryForResults(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].monster =  await monsterController.find({'monster_id': res.monster_id});
    }

    return result as any[] ?? [];
}

// list (all)
export const list = async(): Promise<any[]> => {
    const query = `SELECT * FROM ${table}`;

    const db = new DB();
    const result = await db.executeQueryForResults(query);

    return result as any[] ?? [];
}

// update
export const update = async(id: number, updateParams: {[key: string]: any}): Promise<void> => {
    // filter
    const filtered = _.pick(updateParams, fillableColumns);
    const params = formatDBParamsToStr(filtered, ', ');

    const query = `UPDATE ${table} SET ${params} WHERE id = ${id}`;

    const db = new DB();
    await db.executeQueryForSingleResult(query);
}

// delete (soft delete?)
// export const delete = async(userId: number) => {
//     const query = `DELETE FROM ${table} WHERE user_id = ${userId}`;

//     const db = new DB();
//     await db.executeQueryForSingleResult(query);

//     return result;
// }
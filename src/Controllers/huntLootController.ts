import { formatDBParamsToStr } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import { HuntLoot, fillableColumns } from '../Models/huntLoot';
import * as lootController from './lootController';

const table = 'hunt_loots';

// init entry for user
export const init = async() => { }

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
    const query = `
        SELECT ${fillableColumns.join(",")} 
        FROM ${table} 
        WHERE id = ${id} LIMIT 1`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult(query);
    const loot = await lootController.find({'loot_id': id});
    result.loot = loot;
    return result ?? {};
}

// find (all match)
export const find = async(whereParams: {[key: string]: any}): Promise<HuntLoot[]> => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    const result = await db.executeQueryForResults<HuntLoot>(query);

    if(!result) {
        return [];
    }


    for(const [index, res] of result.entries()) {
        result[index].loot =  await lootController.find({'id': res.loot_id});
    }

    return result as HuntLoot[] ?? [];
}

// list (all)
export const list = async(): Promise<any[]> => {
    const query = `SELECT * FROM ${table}`;

    const db = new DB();
    let result = await db.executeQueryForResults<HuntLoot>(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].loot =  await lootController.find({'id': res.loot_id});
    }

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

import { formatDBParamsToStr } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import * as lootController from './lootController';
import { CraftableRequirement, CraftableRequirementByName, fillableColumns } from "../Models/craftableRequirement";

const table = 'craftable_requirements';

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
export const view = async(id: number) => {
    const query = `SELECT ${fillableColumns.join(",")} FROM ${table} WHERE id = ${id} LIMIT 1`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult<CraftableRequirement>(query);

    if(!result) {
        return undefined;
    }

    result.loot = await lootController.find({ id: result.loot_id });
    return result;
}

export const getCraftableRequirements = async(id: number) => {
    const query = `select craftable_id, l.name, min(l.img_file) as img_file, (sum(1))::integer as value
    from craftable_requirements r
    join monster_loots l
    on r.loot_id = l.id
    where craftable_id = ${id}
    group by 1,2`;

    const db = new DB();
    const result = await db.executeQueryForResults<CraftableRequirementByName>(query);

    if(!result) {
        return [];
    }

    return result ?? [];

}

// find (all match)
export const find = async(whereParams: {[key: string]: any}) => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    const result = await db.executeQueryForResults(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].loot = await lootController.find({ id: res.loot_id });
    }
    return result ?? [];
}

// list (all)
export const list = async() => {
    const query = `SELECT * FROM ${table}`;

    const db = new DB();
    let result = await db.executeQueryForResults<CraftableRequirement>(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].loot = await lootController.find({ id: res.loot_id });
    }
    return result ?? [];
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

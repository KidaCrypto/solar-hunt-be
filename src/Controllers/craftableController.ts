import { formatDBParamsToStr } from "../../utils";
import DB from "../DB"
import _ from "lodash";
import { Craftable, fillableColumns } from '../Models/craftable';
import * as craftableSkillController from './craftableSkillController';
import * as craftableRequirementController from './craftableRequirementController';

const table = 'craftables';

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
    const query = `
        SELECT ${fillableColumns.join(",")} 
        FROM ${table} 
        WHERE id = ${id} LIMIT 1`;

    const db = new DB();
    const result = await db.executeQueryForSingleResult<Craftable>(query);

    if(!result) {
        return undefined;
    }

    const skills = await craftableSkillController.find({'craftable_id': id});
    const requirements = await craftableRequirementController.find({'craftable_id': id});
    result.skills = skills;
    result.requirements = requirements;
    return result;
}

// find (all match)
export const find = async(whereParams: {[key: string]: any}) => {
    const params = formatDBParamsToStr(whereParams, ' AND ');
    const query = `SELECT * FROM ${table} WHERE ${params}`;

    const db = new DB();
    let result = await db.executeQueryForResults<Craftable>(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].skills =  await craftableSkillController.find({'craftable_id': res.id});
        result[index].requirements = await craftableRequirementController.find({'craftable_id': res.id});
    }

    return result;
}

// list (all)
export const list = async() => {
    const query = `SELECT * FROM ${table}`;

    const db = new DB();
    let result = await db.executeQueryForResults<Craftable>(query);

    if(!result) {
        return [];
    }

    for(const [index, res] of result.entries()) {
        result[index].skills =  await craftableSkillController.find({'craftable_id': res.id});
        result[index].requirements = await craftableRequirementController.find({'craftable_id': res.id});
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

import { CraftableRequirement } from "./craftableRequirement";
import { CraftableSkill } from "./craftableSkill";

export type Craftable = {
    id: number;
    name: string;
    img_file: string;
    skills?: CraftableSkill[];
    requirements?: CraftableRequirement[];
}

export const fillableColumns = [
    'name',
    'img_file',
];
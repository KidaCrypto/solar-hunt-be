import dotenv from 'dotenv';
import path from 'path';
import { seedCraftableRequirements, seedCraftableSkills, seedCraftables, seedMonsterLoots, seedMonsters } from './src/Seeders';
dotenv.config({ path: path.join(__dirname, '.env')});

(async() => {
    await seedMonsters();
    await seedMonsterLoots();
    await seedCraftables();
    await seedCraftableSkills();
    await seedCraftableRequirements();
    console.log('Seed ended, press CTRL / CMD + C');
    return;
})();
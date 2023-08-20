export default [
    {
        name: "initial_migration",
        query: `
            CREATE TABLE migrations (
                id serial PRIMARY KEY,
                name text UNIQUE not null,
                migration_group int not null,
                migrated_at timestamp not null
            );`,
        rollback_query: `DROP TABLE migrations;`
    },
    {
        name: "create_monsters_table",
        query: `
            CREATE TABLE monsters (
                id serial PRIMARY KEY,
                name text not null,
                img_file text not null,
                shiny_img_file text not null,
                shiny_chance real not null default 0.1 check (shiny_chance >= 0),
                base_gold real not null default 0,
                max_gold real not null default 0,
                base_exp real not null default 0,
                max_exp real not null default 0,
                catch_rate real not null default 0,
                shiny_catch_rate real not null default 0
            );`,
        rollback_query: `DROP TABLE monsters;`
    },
    {
        name: "create_monster_loots_table",
        query: `
            CREATE TABLE monster_loots (
                id serial PRIMARY KEY,
                name text not null,
                img_file text not null,
                monster_id int not null,
                loot_chance real not null default 0
            );`,
        rollback_query: `DROP TABLE monster_loots;`
    },
    {
        name: "create_hunts_table", // history
        query: `
            CREATE TABLE hunts (
                id serial PRIMARY KEY,
                address text not null,
                monster_id int not null,
                caught boolean not null,
                gold real not null,
                exp real not null,
                is_shiny boolean not null,
                created_at timestamp not null default current_timestamp
            );`,
        rollback_query: `DROP TABLE hunts;`
    },
    {
        name: "create_craftables_table",
        query: `
            CREATE TABLE craftables (
                id serial PRIMARY KEY,
                name text not null,
                img_file text not null
            );`,
        rollback_query: `DROP TABLE craftables;`
    },
    {
        name: "create_craftable_skills_table",
        query: `
            CREATE TABLE craftable_skills (
                id serial PRIMARY KEY,
                craftable_id int not null,
                name text not null,
                value real not null
            );`,
        rollback_query: `DROP TABLE craftable_skills;`
    },
    {
        name: "create_craftable_requirements_table",
        query: `
            CREATE TABLE craftable_requirements (
                id serial PRIMARY KEY,
                craftable_id int not null,
                loot_id int not null,
                value int not null
            );`,
        rollback_query: `DROP TABLE craftable_requirements;`
    },
    {
        name: "create_crafts_table", // history
        query: `
            CREATE TABLE crafts (
                id serial PRIMARY KEY,
                address text not null,
                craftable_id int not null,
                created_at timestamp not null default current_timestamp
            );`,
        rollback_query: `DROP TABLE crafts;`
    },
    {
        name: "create_hunt_loots_table", // history
        query: `
            CREATE TABLE hunt_loots (
                id serial PRIMARY KEY,
                hunt_id int not null,
                loot_id int not null,
                amount int not null
            );`,
        rollback_query: `DROP TABLE hunt_loots;`
    },
    {
        name: "create_nft_metadata_table",
        query: `
            CREATE TABLE nft_metadata (
                id serial PRIMARY KEY,
                uuid text not null,
                metadata text not null
            );`,
        rollback_query: `DROP TABLE nft_metadata;`
    },
    {
        name: "create_nft_metadata_index",
        query: `CREATE INDEX nft_id_index ON nft_metadata (uuid)`,
        rollback_query: `DROP INDEX nft_id_index;`
    },
    {
        name: "create_crafting_uuids_table",
        query: `
            CREATE TABLE crafting_uuids (
                id serial PRIMARY KEY,
                uuid text not null,
                craftable_id int not null,
                address text not null,
                nft_id text not null
            );`,
        rollback_query: `DROP TABLE crafting_uuids;`
    },
    {
        name: "create_crafting_uuids_index",
        query: `CREATE INDEX crafting_uuids_index ON crafting_uuids (uuid)`,
        rollback_query: `DROP INDEX crafting_uuids_index;`
    },
    {
        name: "create_account_migrations_table",
        query: `
            CREATE TABLE account_migrations (
                id serial PRIMARY KEY,
                account text not null,
                migration_link text not null
            );`,
        rollback_query: `DROP TABLE account_migrations;`
    },
    {
        name: "create_account_migrations_index",
        query: `CREATE INDEX account_migrations_index ON account_migrations (account)`,
        rollback_query: `DROP INDEX account_migrations_index;`
    },
];
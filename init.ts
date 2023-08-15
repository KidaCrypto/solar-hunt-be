import { CRAFTABLE_COLLECTION, CRAFTABLE_SYMBOL, LOOT_COLLECTION, LOOT_SYMBOL, MONSTER_COLLECTION, MONSTER_SYMBOL } from "./src/Constants";
import { loadOrGenerateKeypair } from "./src/Helpers";
import { initializeTree } from "./src/NFT/Initializer";
import { initializeToken, mintTo } from "./src/Token";

(async() => {
    await initializeTree({
        name: "Solar Hunt Monsters",
        symbol: MONSTER_SYMBOL,
        whichCollection: MONSTER_COLLECTION,
        uri: "https://solarhunt.kidas.app/monsterTree.json",
        sellerFeeBasisPoints: 0,
    });
    await initializeTree({
        name: "Solar Hunt Craftables",
        symbol: CRAFTABLE_SYMBOL,
        whichCollection: CRAFTABLE_COLLECTION,
        uri: "https://solarhunt.kidas.app/craftableTree.json",
        sellerFeeBasisPoints: 0,
    });
    await initializeTree({
        name: "Solar Hunt Loots",
        symbol: LOOT_SYMBOL,
        whichCollection: LOOT_COLLECTION,
        uri: "https://solarhunt.kidas.app/lootTree.json",
        sellerFeeBasisPoints: 0,
    });
    await initializeToken("gold");
    await initializeToken("exp");
})();
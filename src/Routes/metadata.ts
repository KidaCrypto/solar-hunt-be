import { Router } from 'express';
import * as controller from '../Controllers/nftMetadataController';
import { MetaplexStandard } from '../NFT/Minter/types';


export const routes = Router();


// list
// routes.get('/', async (req, res) => {
//     return res.json(await controller.list());
// });

// get
routes.get('/:id', async (req, res) => {
    let uuid = req.params.id.replace(".json", "");
    let metadataStrings = await controller.find({ uuid });

    if(metadataStrings.length === 0) {
        return {};
    }

    let metadata = JSON.parse(metadataStrings[0].metadata) as MetaplexStandard;

    return res.send(metadata);
});
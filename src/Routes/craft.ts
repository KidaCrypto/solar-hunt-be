import { Router } from 'express';
import * as controller from '../Controllers/craftController';


export const routes = Router();


// list
// routes.get('/', async (req, res) => {
//     return res.json(await controller.list());
// });

// get
// routes.get('/:id', async (req, res) => {
//     return res.json(await controller.view(parseInt(req.params.id)));
// });

// find
// routes.post('/find', async (req, res) => {
//     return res.json(await controller.find(req.body));
// });

// create
routes.post('/pre', async(req, res) => {
    let data = req.body;
    try {
        if(!data.craftable_id || !data.nft_ids || data.isPublicKey === undefined || data.isPublicKey === null || !data.account) {
            return res.status(400).send({ success: false, message: "die die die" });
        }
        const result = await controller.preCraft(data);
        return res.json({ success: true, data: result });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

routes.post('/', async(req, res) => {
    let data = req.body;
    try {
        if(!data.uuid) {
            return res.status(400).send({ success: false, message: "die die die" });
        }
        const result = await controller.newCraft(data);
        return res.json({ success: true, data: result });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

routes.post('/error', async(req, res) => {
    let data = req.body;
    try {
        if(!data.uuid) {
            return res.status(400).send({ success: false, message: "die die die" });
        }
        const result = await controller.errorCraft(data);
        return res.json({ success: true, data: result });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

// update
// have to use POST to update (because multer does not support PUT)
routes.post('/update/:id', /* contentUpload.single('profile_picture'), */ async(req, res) => {
});

// check if user exist and signature empty?
// if empty update it with the current signature
routes.post('/verify', async(req, res) => {
});
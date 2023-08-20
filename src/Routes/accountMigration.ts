import { Router } from 'express';
import * as controller from '../Controllers/accountMigrationController';

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
routes.post('/find', async (req, res) => {
    let data = req.body;

    if(!data.account) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {
        let ret = await controller.find({ account: data.account });
        return res.json({ success: true, data: ret });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

routes.post('/migrate', async(req, res) => {
    let data = req.body;

    if(!data.account) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {
        let tiplinkUrl = await controller.migrate(data.account);
        return res.json({ success: true, data: tiplinkUrl });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});

routes.post('/clawback', async(req, res) => {
    let data = req.body;

    if(!data.account) {
        return res.status(400).send({ success: false, message: "Missing params" });
    }

    try {
        await controller.clawback(data.account);
        return res.json({ success: true, data: "yes" });
    }

    catch {
        return res.status(500).send({ success: false, message: "die die die" });
    }
});
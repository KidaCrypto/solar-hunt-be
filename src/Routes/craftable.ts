import { Router } from 'express';
import * as controller from '../Controllers/craftableController';


export const routes = Router();


// list
routes.get('/', async (req, res) => {
    return res.json(await controller.list());
});

// get
routes.get('/:id', async (req, res) => {
    return res.json(await controller.view(parseInt(req.params.id)));
});

// find
routes.post('/find', async (req, res) => {
    return res.json(await controller.find(req.body));
});

// update
// have to use POST to update (because multer does not support PUT)
routes.post('/update/:id', /* contentUpload.single('profile_picture'), */ async(req, res) => {
});

// check if user exist and signature empty?
// if empty update it with the current signature
routes.post('/verify', async(req, res) => {
});
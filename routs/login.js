const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { getSell } = require('../schemas/sell');
const _ = require('lodash');
const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});
router.post('/', async  (req, res) => {
    const result = loginSchema.validate(req.body);
    if(result.error) 
    return res.status(400).send('invalid body');
    let user = await getSell(req.body.email); 
    if(user == null) return res.status(400).send('invalid e-mail or password');
    const valid = await bcrypt.compare(req.body.password, user.password);
    if(!valid) return res.status(400).send(result);
    return res.send(_.pick(user, ['public']));
})
router.get('/', (req, res) => {
    
})
module.exports = router;
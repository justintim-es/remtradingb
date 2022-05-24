const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { getUser } = require('../schemas/user');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const loginSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});
router.post('/', async  (req, res) => {
    const result = loginSchema.validate(req.body);
    if(result.error) 
    return res.status(400).send('invalid body');
    let user = await getUser(req.body.email); 
    if(user == null) return res.status(400).send('invalid e-mail or password');
    const valid = await bcrypt.compare(req.body.password, user.password);
    if(!valid) return res.status(400).send('invalid e-mail or password');
    if(!user.isConfirmed) return res.status(400).send('please confirm your e-mail first');
    const token = jwt.sign({ id: user._id },  'askudhasjdhjadsh');
    return res.send(token);
})
module.exports = router;
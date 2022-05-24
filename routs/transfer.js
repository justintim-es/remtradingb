const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const { getUserById, addTransaction, getSell } = require('../schemas/user');
const { Transaction } = require('../schemas/transaction');
const auth = require('../middleware/auth');
const _ = require('lodash');
const { glaurl } = require('../constants');
const transferSchema = Joi.object({ 
    publicKey: Joi.string().required(),
    amount: Joi.string().required()
});
router.post('/liber-tx', auth, async (req, res) => {
    const result = transferSchema.validate(req.body);
    if(result.error) return res.status(400).send('invalid body');
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-liber-transaction`, {
        from: user.private,
        to: req.body.publicKey,
        gla: req.body.amount 
    }).then(async resp => {
        await addTransaction(req.id, new Transaction({ transactionId: resp.data.transactionIdentitatis }));
        return res.send();
    }).catch(err => {
        console.log(err);
        return res.status(400).send(err.response?.data);
    });
});
router.post('/fixum-tx', auth, async (req, res) => {
    const result = transferSchema.validate(req.body);
    if(result.error) return res.status(400).send('invalid body');
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-fixum-transaction`, {
        from: user.private,
        to: req.body.publicKey,
        gla: req.body.amount
    }).then(resp => res.send()).catch(err => res.status(400).send(err.response?.data));
});
const burnSchema = Joi.object({
    probationem: Joi.string().required(),
    gla: Joi.string().required()
});
router.post('/burn-liber', auth, async (req, res) => {
    const result = burnSchema.validate(req.body);
    if(result.error) return res.status(400).send('Invalid body');
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-liber-transaction`, {
        from: user.private, 
        to: req.body.probationem,
        gla: req.body.gla,
    }).then(async aresslt => {
        await addTransaction(req.id, new Transaction({ transactionId: aresslt.data.transactionIdentitatis }));
        return res.send();
    }).catch(err => res.status(400).send(err.response?.data))
});
router.post('/burn-fixum', auth, async (req, res) => {
    const result = burnShema.validate(req.body);
    if(result.error) return res.status(400).send('Invalid body');
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-fixum-transaction`, {
        from: user.private, 
        to: req.body.probationem,
        gla: req.body.gla,
    }).then(async aresslt => {
        await addTransaction(req.id, new Transaction({ transactionId: aresslt.data.transactionIdentitatis }));
        return res.send();
    }).catch(err => res.status(400).send(err.response?.data))
})
const burnSellSchema = Joi.object({
    probationem: Joi.string().required(),
    gla: Joi.string().required(),
    id: Joi.string().required()
});
router.post('/burn-4-sell-liber', auth, async (req, res) => {
    console.log(req.body);
    const result = burnSellSchema.validate(req.body);
    if(result.error) return res.status(400).send({ english: 'Invalid body' });
    const sell = await getSell(req.id, req.body.id);
    axios.post(`${glaurl}/submittere-liber-transaction`, {
        from: sell.private,
        to: req.body.probationem,
        gla: req.body.gla
    }).then(async aresslt =>  {
        await addTransaction(req.id, new Transaction({ transactionId: aresslt.data.transactionIdentitatis }));
        return res.send();
    }).catch(err => res.status(400).send(err.response?.data))
})
router.post('/burn-4-sell-fixum', auth, async (req, res) => {
    console.log(req.body);
    const result = burnSellSchema.validate(req.body);
    if(result.error) return res.status(400).send({ english: 'Invalid body' });
    const sell = await getSell(req.id, req.body.id);
    axios.post(`${glaurl}/submittere-fixum-transaction`, {
        from: sell.private,
        to: req.body.probationem,
        gla: req.body.gla
    }).then(async aresslt =>  {
        await addTransaction(req.id, new Transaction({ transactionId: aresslt.data.transactionIdentitatis }));
        return res.send();
    }).catch(err => res.status(400).send(err.response?.data))
})
router.get('/', auth, async (req, res) => {
    const user = await getUserById(req.id);
    return res.send(user.transactions.sort((a, b) => new Date(b.date) - new Date(a.date)));
});
router.get('/transaction/:id', auth, async (req, res) => {
    axios.get(`${glaurl}/transaction/${req.params.id}`).then(resp => {
        return res.send(resp.data);
    }).catch(err => res.status(400).send(err.response?.data));
});
router.get('/defenditur', auth, async (req, res) => {
    const user = await getUserById(req.id);
    axios.get(`${glaurl}/defenditur/${user.public}`).then(is => {
        return res.send(is.data.defenditur);
    }).catch(err => res.status(400).send());
});
module.exports = router;
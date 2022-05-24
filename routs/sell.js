const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Joi = require('joi');
const axios = require('axios');
const { getUserById, addSell, addTransaction, updateSellPayment, getSell, getPayments, updateSellIsBalance, addRecognition, removeRecognition } = require('../schemas/user');
const { Sell } = require('../schemas/sell');
const _ = require('lodash');
const { glaurl, confirmations } = require('../constants');
const { Transaction } = require('../schemas/transaction');
const { Payment } = require('../schemas/payment');
const { Recognition } = require('../schemas/recognition')
const app = express();
const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');
const randomString = require('random-string');
const createSchema = Joi.object({
    unit: Joi.string().required(),
    gla: Joi.string().required(),
    price: Joi.number().required()
});
router.post('/create-lgla', auth, async (req, res) => {
    const user = await getUserById(req.id);
    axios.get(`${glaurl}/novus-propter`).then(aresnp => {
        console.log('1');
        const public = aresnp.data.publicaClavis;
        axios.post(`${glaurl}/submittere-rationem`, { 
            publicaClavis: public
        }).then(async aressr => {
            console.log('2');
            await addSell(req.id, new Sell({ 
                liber: true, 
                private: aresnp.data.privatusClavis, 
                public: aresnp.data.publicaClavis, 
                rationemId: aressr.data.propterIdentitatis,
            }));
            return res.send();
        }).catch(err => {
            console.log(err);
            res.status(400).send(err.response?.data.english)
        });
    }).catch(err => {
        console.log(err);
        res.status(400).send(err.response?.data.english)
    })
});
const reuseSellSchema = Joi.object({
    schema: Joi.string().required()
});
router.post('/reuse-sell/:sell', auth, async (req, res) => {
    const sell = await getSell(req.id, req.params.sell);
    const payments = await getPayments(req.id, req.params.sell);
    for (let i = 0; i < payments.length; i++) {
        if (!payments[i].isPool) return res.status(400).send({ message: 'can not reuse account payment is still pending'})
    }
    await axios.get(`${glaurl}/transaction/${payments[payments.length-1].txId}`).then(async arest => {
        if (parseInt(arest.data.data.confirmationes) < confirmations) return res.status(400).send({ message: `still waiting on 10 confirmations current ${arest.data.data.confirmationes}`});            
        await removeRecognition(payments[i].deschel);
        return res.send();
    }).catch(err => {
        console.log(err);
        return res.status(400).send(err.response?.data)
    });
});
const transferAcc = Joi.object({
    to: Joi.string().required(),
    gla: Joi.number().required(),
    unit: Joi.string().required()
});
router.post('/transfer-acc/:sell', auth, async (req, res) => {
    console.log(req.body);
    const result = transferAcc.validate(req.body);
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-liber-transaction`, {
        from: user.private,
        to: req.body.to,
        gla: req.body.gla.toString(),
        unit: req.body.unit
    }).then(async aresslt => {
        await addTransaction(req.id, new Transaction({ transactionId: aresslt.data.transactionIdentitatis }));
        await updateSellIsBalance(req.id, req.params.sell);
        return res.send();
    }).catch(err => {
        console.log(err);
        return res.status(400).send(err.response?.data.english);
    });
})
router.get('/sells', auth, async (req, res) => {
    const user = await getUserById(req.id);
    const sorted = user.sells.sort((a, b) => new Date(b.date) - new Date(a.date));
    return res.send(_.map(sorted, u => ({
        ..._.pick(u, ['_id', 'liber', 'isBalance', 'isActive', 'gla', 'rationemId', 'public']),
        payment: _.pick(_.last(u.payments), ['price', 'isSold', 'average', 'isPool', 'deschel'])
    })));
});

router.get('/last-payment/:sell', auth, async (req, res) => {
    const sell = await getSell(req.id, req.params.sell);
    return res.send(_.pick(sell.payments[sell.payments.length-1], ['price', 'average']));
})
router.get('/rationem-status/:id', auth, async (req, res) => {
    const result = createSchema.validate(req.body);
    if(result.error) return res.status(400).send('Invalid body');
    const user = await getUserById(req.id);
    return res.send(user.rationem);
});
router.post('/create-fgla', auth, async (req, res) => {    
    const result = createSchema.validate(req.body);
    if(result.error)
    return res.send();
});
router.get('/rationem/:id', auth, async (req, res) => {
    axios.get(`${glaurl}/rationem/${req.params.id}`)
    .then(aresr => res.send({ data: aresr.data.data, scriptum: aresr.data.scriptum, gladiator: aresr.data.gladiatorId, rationemIndex: aresr.data.data.index }))
    .catch(err => res.status(400).send(err.response?.data))
});

router.get('/is-onboard-complete', auth, async (req, res) => {
    const user = await getUserById(req.id);
    if(user.stripeAccountId) {
        const account = await stripe.accounts.retrieve(user.stripeAccountId);
        if(account.business_profile.url) return res.send({ is: true, link: null, isAccount: true })
        return res.send({ is: true, link: user.onboardLink, isAccount: true });
    }
    return res.send({ is: false, link: null, isAccount: false })
});
const activateSchema = Joi.object({
    price: Joi.number().required(),
})
router.post('/activate/:id', auth, async (req, res) => {
    const result = activateSchema.validate(req.body);
    if(result.error) return res.status(400).send(result.error.details[0].message);
    if(req.body.price < 200) return res.status(400).send('price should be greater than 200');
    const user = await getUserById(req.id);
    const sell = await getSell(req.id, req.params.id);
    const rs = randomString({ length: 510 });
    console.log('sell', req.params.id);
    console.log('recgnition', rs);
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'eur', 
                    product_data: {
                        name: 'GLA'
                    },
                    unit_amount: req.body.price
                },
                quantity: 1
            }
        ],
        mode: 'payment',
        success_url: 'https://resalewebsite.io/payment-success/' + req.params.id + '/'  + rs,
        cancel_url: 'https://resalewebsite.io/payment-cancel/' + req.params.id + '/'  + rs,
        payment_intent_data: {
            application_fee_amount: 100,
        }
    }, {
        stripeAccount: user.stripeAccountId
    });
    const payments = await getPayments(req.id, req.params.id);
    for (let i = 0; i < payments.length; i++) {
        if (!payments[i].isPool) return res.status(400).send('previous payment still pending');
    }
    axios.get(`${glaurl}${sell.liber ? '/liber-statera/' : '/fixum-statera/'}${sell.public}`).then(async aress => {
        const deschel = randomString({ length: 51 });
        await addRecognition(req.id, new Recognition({
            payout: rs,
            delete: deschel
        }));
        await updateSellPayment(req.id, req.params.id, new Payment({
            url: session.url,
            price: req.body.price,
            deschel: deschel,
            sessionId: session.id,
            gla: aress.data.statera,
            average: parseInt(req.body.price * 100) / parseInt(aress.data.statera)
        }));
        return res.send();
    }).catch(err => {
        console.log(err);
        return res.status(400).send(err.response?.data);
    });
});
module.exports = router;
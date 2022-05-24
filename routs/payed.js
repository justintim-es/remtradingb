const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');
const { getSellRecognition, addTransaction, updatePaymentTxId, getUserById, getUserRecognition } = require('../schemas/user');
const { glaurl } = require('../constants');

const { Transaction } = require('../schemas/transaction');
const axios = require('axios');
const Joi = require('joi');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'gladiatorscrypto@gmail.com', // generated ethereal user
      pass: 'xjrstlpcgmncsjir', // generated ethereal password
    },
});
const sessionLiberSchema = Joi.object({
    sell: Joi.string().required(),
    recognition: Joi.string().required(),
})
router.post('/session-liber', auth, async (req, res) => {
    const result = sessionLiberSchema.validate(req.body);
    if(result.error) return res.status(400).send(result.error.details[0].message);
    const buyer = await getUserById(req.id);
    const recognition = req.body.recognition;
    console.log(recognition);
    const sell = await getSellRecognition(recognition, req.body.sell)
    const seller = await getUserRecognition(recognition);
    if(!sell) return res.status(400).send('invalid recognition couldnt find sell');
    const session = await stripe.checkout.sessions.retrieve(sell.payments[sell.payments.length-1].sessionId, {
        stripeAccount: seller.stripeAccountId
    });
    if (session.payment_status == "paid") {
        await axios.get(`${glaurl}${sell.liber ? '/liber-statera' : '/fixum-statera'}/${sell.public}`).then(async areslfss => {
            if(parseInt(areslfss.data.statera) > parseInt(0) && !sell.payments[sell.payments.length-1].txId && !sell.payments[sell.payments.length-1].isSold) {
                console.log(areslfss.data.statera);
                await axios.post(`${glaurl}${sell.liber ? '/submittere-liber-transaction' : '/submittere-fixum-transaction'}`, {
                    from: sell.private,
                    to: buyer.public,
                    gla: (parseInt(areslfss.data.statera) / 2).toString(),
                }).then(async aressslftt => {
                    await updatePaymentTxId(recognition, req.body.sell, aressslftt.data.transactionIdentitatis);
                    await addTransaction(req.id, new Transaction({
                        transactionId: aressslftt.data.transactionIdentitatis
                    }));
                    let info = await transporter.sendMail({
                        from: 'gladiatorscrypto@gmail.com', // sender address
                        to: ["noahvandenbergh@hotmail.nl"], // list of receivers
                        subject: "In case of a fork", // Subject line
                        text: 'Please resubmit your transaction in case of a fork by pressing on the link below \nhttps://localhost:4200/payment-success/' + req.body.sell + '/'  + recognition, // plain text body
                    });
                    return res.send();
                }).catch(err => {
                    console.log(err);
                    return res.status(400).send(err);
                })
            } else if (parseInt(areslfss.data.statera) > parseInt(0) && sell.payments[sell.payments.length-1].txId) {
                await axios.get(`${glaurl}/transaction/${sell.payments[sell.payments.length-1].txId}`).then(arest => {
                    return res.send('tx still pending');
                }).catch(async err => {
                    await axios.get(`${glaurl}${sell.liber ? '/liber-statera' : '/fixum-statera'}/${sell.public}`, {
                        from: sell.private,
                        to: buyer.public,
                        gla: (parseInt(areslfss.data.statera) / 2).toString()
                    }).then(async areslfss => {
                        await updatePaymentTxId(recognition, req.body.sell, areslfss.data.transactionIdentitatis);
                        await addTransaction(req.id, new Transaction({ transactionId: areslfss.data.transactionIdentitatis }));
                        return res.send();
                    }).catch(err => {
                        console.log(err);
                        return res.status(400).send(err.response?.data)
                    });
                });
            } else {
                console.log(parseInt(areslfss.data.statera));
                console.log(sell.payments[sell.payments.length-1].txId);
            }
        }).catch(err => {
            console.log(err);
            return res.status(400).send(err);
        })
    } else {
        return res.status(400).send('not payed');
    }
});

module.exports = router;
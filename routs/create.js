const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');
const Joi = require('joi');
const { createSell, confirmSell, getConfirmSellConfirmation, onboardSell, createBuy, confirmBuy } = require('../schemas/sell');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomString = require('random-string');
const axios = require('axios');
router.get('/new/:lang', async (req, res) => {
  const account = await stripe.accounts.create({
    type: 'custom',
    country: req.params.lang,
    capabilities: {
      card_payments: {requested: true},
      transfers: {requested: true},
    }
  });
  return res.send(account.id);
});
const sendSchema = Joi.object({
  accountId: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'gladiatorscrypto@gmail.com', // generated ethereal user
      pass: 'xjrstlpcgmncsjir', // generated ethereal password
    },
});
router.post('/send-email', async (req, res) => {
  const schema = sendSchema.validate(req.body);
  if(schema.error) return res.status(400).send();
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(req.body.password, salt);
  const confirmation = randomString({ length: 64 });
  const sell = await createSell(
    confirmation,
    req.body.email,
    hashed,
    req.body.accountId
  );
  let info = await transporter.sendMail({
    from: 'gladiatorscrypto@gmail.com', // sender address
    to: ["noahvandenbergh@hotmail.nl"], // list of receivers
    subject: "Confirm your e-mail", // Subject line
    text: "Pleas confirm your e-mail by pressing on the link below \nhttp://localhost:4200/confirm/" + confirmation, // plain text body
  });
  console.log(info);
  return res.send();
});
const sendBuySchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

router.post('/send-email-buy', async (req, res) => {
  const schema = sendBuySchema.validate(req.body);
  const confirmation = randomString({ length: 64 });
  const sell = await createBuy(
    confirmation,
    req.body.email,
    hashed,
    req.body.accountId
  );
  if (schema.error) return res.status(400).send()
  let info = await transporter.sendMail({
    from: 'gladiatorscrypto@gmail.com', // sender address
    to: ["noahvandenbergh@hotmail.nl"], // list of receivers
    subject: "Confirm your e-mail", // Subject line
    text: "Pleas confirm your e-mail by pressing on the link below \nhttp://localhost:4200/confirm/" + confirmation, // plain text body
  });
  return res.send();
})
router.get('/payment', async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    payment_method_types: ['card'],
    amount: 1000,
    currency: 'eur',
    application_fee_amount: 123,
  }, {
    stripeAccount: 'acct_1KehfTPOhsiONSKc',
  });
  console.log(paymentIntent);
  return res.send(paymentIntent);
});
router.get('/link/:confirmation', async (req, res) => {
  const random = randomString({ length: 32 });
  const confirmation = req.params.confirmation;
  await confirmSell(confirmation, random);
  const sell = await getConfirmSellConfirmation(confirmation);
  const accountLink = await stripe.accountLinks.create({
    account: sell.stripeAccountId,
    refresh_url: 'https://buy.resalewebsite.io/onboarded/' + random,
    return_url: 'https://buy.resalewebsite.io/login/' + random,
    type: 'account_onboarding',
  });
  return res.send(accountLink.url);
});
router.post('/buy-confirm/:confirmation', async (req, res) => {
  await confirmBuy(req.params.confirmation);
  return res.send()
})
router.post('/onboarded/:onboarding', async (req, res) => {
  const onboarding = req.params.onboarding;
  axios.get('http://127.0.0.1:1515/novus-propter').then(async keypair => {
    console.log(keypair)
    console.log('gotheres', keypair.publicaClavis, keypair.privatusClavis);
    await onboardSell(onboarding, keypair.data.publicaClavis, keypair.data.privatusClavis);
    return res.send();
  }).catch(err => res.status(400).send(err))
})
module.exports = router;

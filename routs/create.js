const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');
const Joi = require('joi');
const { createSell, getUserById, confirmSell, onboardSell, createBuy, confirmBuy, getConfirmUserConfirmation, getUserOnboarding, updateUserConfirmation, updateBuyToSell } = require('../schemas/user');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomString = require('random-string');
const axios = require('axios');
const { glaurl } = require('../constants');
const auth = require('../middleware/auth');
router.get('/new/:lang', async (req, res) => {
  const account = await stripe.accounts.create({
    type: 'express',
    country: req.params.lang,
    capabilities: {
      card_payments: {requested: true},
      transfers: {requested: true},
    },
    business_profile: {
      url: 'http://trade.gladiato.rs'
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
  return res.send();
});
const sendBuySchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
});

router.post('/send-email-buy', async (req, res) => {
  const schema = sendBuySchema.validate(req.body);
  const confirmation = randomString({ length: 64 });
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(req.body.password, salt);
  const sell = await createBuy(
    confirmation,
    req.body.email,
    hashed,
    req.body.accountId
  );
  if (schema.error) return res.status(400).send();
  let info = await transporter.sendMail({
    from: 'gladiatorscrypto@gmail.com', // sender address
    to: ["noahvandenbergh@hotmail.nl"], // list of receivers
    subject: "Confirm your e-mail", // Subject line
    text: "Pleas confirm your e-mail by pressing on the link below \nhttp://localhost:4200/confirm-buy/" + confirmation, // plain text body
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
  const sell = await getConfirmUserConfirmation(confirmation);
  const accountLink = await stripe.accountLinks.create({
    account: sell.stripeAccountId,
    refresh_url: 'https://buy.resalewebsite.io/onboard-fail/' + confirmation,
    return_url: 'https://buy.resalewebsite.io/onboarded/' + random,
    type: 'account_onboarding',
  });
  await updateUserConfirmation(confirmation, accountLink.url);
  return res.send(accountLink.url);
});
router.get('/buy-to-sell-link/:stripe', auth, async (req, res) => {
  const random = randomString({ length: 510 });
  const stripeId = req.params.stripe;
  const accountLink = await stripe.accountLinks.create({
    account: req.params.stripe,
    refresh_url: 'https://buy.resalewebsite.io/login/',
    return_url: 'https://buy.resalewebsite.io/onboarded/' + random,
    type: 'account_onboarding',
  });
  await updateBuyToSell(req.id, accountLink.url, random, stripeId);
  return res.send(accountLink.url);
})
router.post('/confirm-buy/:confirmation', async (req, res) => {
  const confirmation = req.params.confirmation;
  const buy = await getConfirmUserConfirmation(confirmation);
  if (!buy.public) {
    axios.get(`${glaurl}/novus-propter`).then(async keypair => {
      await confirmBuy(confirmation, keypair.data.publicaClavis, keypair.data.privatusClavis);
      return res.send();    
    }).catch(err => res.status(400).send('connection refused with blockchain'));
  } else {
    return res.status(400).send('user is already confirmed');
  }
})
router.post('/onboarded/:onboarding', async (req, res) => {
  const onboarding = req.params.onboarding;
  const sell = await getUserOnboarding(onboarding);
  if(!sell.public) {
    await axios.get(`${glaurl}/novus-propter`).then(async keypair => {
      await onboardSell(onboarding, keypair.data.publicaClavis, keypair.data.privatusClavis);
      return res.send();
    }).catch(err => res.status(400).send({ error: err }))
  } else {
    return res.status(400).send('user is already onboarded');     
  }
})
module.exports = router;

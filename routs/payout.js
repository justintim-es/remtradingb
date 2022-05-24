const express = require('express');
const router = express.Router();
const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');
const { getUserById } = require('../schemas/user');
const auth = require('../middleware/auth');

router.get('/balance', auth, async (req, res) => {
    const user = await getUserById(req.id);
    const balance = await stripe.balance.retrieve({
        stripeAccount: user.stripeAccountId
    });
    let baschal = 0;
    for (let i = 0; i < balance.available.length; i++) {
        baschal += balance.available[i].amount
    }
    return res.send({ balance: baschal })
})



module.exports = router;
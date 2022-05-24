const stripe = require('stripe')('sk_test_51KVxlPAGQn2FqgzDtqLjvtGTOEEFqOVjNCMALmXVSodlaplQ6hHE1yczSONPOSGa8GVRpVUyGhnKQ3zYEfVvaeWM001Wtrx9YB');

async function retrieveAccount() {
    const acc = await stripe.accounts.retrieve('acct_1Kvoh0PAgMuT7bMK');
    console.log(acc);
}
retrieveAccount();

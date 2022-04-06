const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  confirmation: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isConfirmed: {
    type: Boolean,
    required: true
  },
  stripeAccountId: String,
  onboarding: {
    type: String,
  },
  isOnboarded: {
    type: Boolean,
    required: false,
  },
  public: String,
  private: String
});
const User = mongoose.model('User', userSchema);

async function createSell(confirmation, email, password, stripeAccountId) {
  const sell = new Sell({
    confirmation,
    email,
    password,
    isConfirmed: false,
    stripeAccountId,
    isOnboarded: false
  });
  const result = await sell.save();
  return result;
}
async function confirmUser(confirmation, onboarding) {
  await Sell.updateOne({ confirmation: confirmation }, {
    $set: {
      isConfirmed: true,
      onboarding: onboarding
    }
  });
}
async function getConfirmUserConfirmation(confirmation) {
  return await Sell.findOne({ confirmation: confirmation });
}
async function onboardSell(onboarding, public, private) {
  await Sell.updateOne({ onboarding: onboarding }, {
    $set: {
      isOnboarded: true,
      public: public,
      private: private
    }
  })
}

async function getSell(email) {
  return await Sell.findOne({ email: email });
}
module.exports.createSell = createSell;
module.exports.confirmUser = confirmUser;
module.exports.getConfirmUserConfirmation = getConfirmUserConfirmation;
module.exports.getSell = getSell;
module.exports.onboardSell = onboardSell;

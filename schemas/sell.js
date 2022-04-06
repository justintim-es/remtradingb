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
  isOnboarded: Boolean,
  public: String,
  private: String
});
const User = mongoose.model('User', userSchema);

async function createSell(confirmation, email, password, stripeAccountId) {
  const sell = new User({
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
async function createBuy(confirmation, email, password) {
  const buy = new User({
    confirmation,
    email,
    password,
    isConfirmed: false,
  });
  const result = await buy.save();
  return result;
}
async function confirmSell(confirmation, onboarding) {
  await User.updateOne({ confirmation: confirmation }, {
    $set: {
      isConfirmed: true,
      onboarding: onboarding
    }
  });
}
async function confirmBuy(confirmation) {
  await User.updateOne({ confirmation: confirmation }, {
    $set: {
      isConfimred: true,
    }
  })
}
async function getConfirmUserConfirmation(confirmation) {
  return await Sell.findOne({ confirmation: confirmation });
}
async function onboardSell(onboarding, public, private) {
  await User.updateOne({ onboarding: onboarding }, {
    $set: {
      isOnboarded: true,
      public: public,
      private: private
    }
  })
}

async function getSell(email) {
  return await User.findOne({ email: email });
}
module.exports.createSell = createSell;
module.exports.confirmBuy = confirmBuy;
module.exports.confirmSell = confirmSell;
module.exports.getConfirmUserConfirmation = getConfirmUserConfirmation;
module.exports.getSell = getSell;
module.exports.onboardSell = onboardSell;
module.exports.createBuy = createBuy;
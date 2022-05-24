const mongoose = require('mongoose');
const { transactionSchema } = require('./transaction');
const { sellSchema } = require('../schemas/sell');
const { recognitionSchema } = require('../schemas/recognition');
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
    default: false,
    required: true
  },
  code: String,
  onboarding: {
    type: String,
  },
  transactions: [transactionSchema],
  sells: [sellSchema],
  isOnboarded: {
    type: Boolean,
    required: true,
    default: false
  },
  stripeAccountId: String,
  public: String,
  private: String,
  rationemId: String,
  gladiatorId: String,
  onboardLink: String,
  gladiatorIndex: Number,
  recognitions: [recognitionSchema]
});
const User = mongoose.model('User', userSchema);

async function createSell(confirmation, email, password, stripeAccountId) {
  const sell = new User({
    confirmation,
    email,
    password,
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
async function confirmBuy(confirmation, public, private) {
  await User.updateOne({ confirmation: confirmation }, {
    $set: {
      isConfirmed: true,
      public: public,
      private: private
    }
  });
}
async function getConfirmUserConfirmation(confirmation) {
  return await User.findOne({ confirmation: confirmation });
}
async function updateUserConfirmation(confirmation, onboardLink) {
  await User.updateOne({ confirmation: confirmation}, {
    $set :{
      onboardLink: onboardLink
    }
  })
} 
async function getUserOnboarding(onboarding) {
  return await User.findOne({ onboarding: onboarding });
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
async function getUser(email) {
  return await User.findOne({ email: email });
}
async function getUserById(id) {
  return await User.findById(id);
}
async function addTransaction(userId, transaction) {
  const user = await User.findById(userId);
  user.transactions.push(transaction);
  await user.save();
} 
async function addSell(userId, sell) {
  const user = await User.findById(userId);
  user.sells.push(sell);
  await user.save();
}
async function defend(userId, rationemId) {
  await User.updateOne({ _id: userId }, {
    $set: {
      rationemId: rationemId
    }
  })
}
async function isDefendedTrue(userId) {
  await User.updateOne({ _id: userId }, {
    $set: {
      isDefend: true
    }
  })
}
async function updateGladiatorId(userId, gladiatorId, gladiatorIndex) {
  await User.updateOne({ _id: userId }, {
    $set: {
      gladiatorId: gladiatorId,
      gladiatorIndex: gladiatorIndex
    }
  })
}
async function getSell(userId, sellId) {
  const user = await User.findById(userId);
  const sell = user.sells.id(sellId);
  return sell;
}
async function updateSellIsBalance(userId, sellId) {
  const user = await User.findById(userId);
  const sell = user.sells.id(sellId);
  sell.isBalance = true;
  await user.save();
}
async function updateSellPrice(userId, sellId, price) {
  const user = await User.findById(userId);
  const sell = user.sells.id(sellId);
  sell.price = price;
  await user.save();
}
async function updateSellPayment(userId, sellId, payment) {
  const user = await User.findById(userId);
  const sell = user.sells.id(sellId);
  sell.payments.push(payment);
  sell.isActive = true;
  await user.save();
}
async function getAllSells() {
  const users = await User.find();
  const sells = [];
  for (let i = 0; i < users.length; i++) {
    const filtered = users[i].sells.filter(x => x.isActive);
    for (let f = 0; f < filtered.length; f++) {
      sells.push(filtered[f]);
    }
  }
  return sells;
}
async function updateBuyToSell(userId, onboardLink, onboarding, stripeAccountId) {
  await User.updateOne({ _id: userId }, {
    $set: {
      onboardLink: onboardLink,
      onboarding: onboarding,
      stripeAccountId: stripeAccountId
    }
  })
}
async function addRecognition(userId, recognition) {
  const user = await User.findById(userId);
  user.recognitions.push(recognition);
  await user.save();
}
async function getSellRecognition(recognition, sellId) {
  const user = await User.findOne({ "recognitions.payout": recognition });
  const sell = user.sells.id(sellId);
  return sell;
}
async function getUserRecognition(recognition) {
  return await User.findOne({ "recognitions.payout": recognition });
}
async function updatePaymentTxId(recognition, sellId, txId) {
  const user = await User.findOne({ "recognitions.payout": recognition });
  const sell = user.sells.id(sellId);
  sell.payments[sell.payments.length-1].isSold = true;
  sell.payments[sell.payments.length-1].txId = txId;
  sell.payments[sell.payments.length-1].isPool = true;
  await user.save();
}
async function removeRecognition(deschel) {
  const user = await User.findOne({ recognitions: { deschel: deschel } });
  const index = user.recognitions.indexOf(recognition);
  user.recognitions.splice(index, 1);
  await user.save();
}
async function getPayments(userId, sellId) {
  const user = await User.findById(userId);
  const sell = user.sells.id(sellId);
  return sell.payments;
}
async function getSeller(recognition) {
  return await User.findOne({ recognitions: { payout: recognition } });
}
module.exports.createSell = createSell;
module.exports.confirmSell = confirmSell;
module.exports.getConfirmUserConfirmation = getConfirmUserConfirmation;
module.exports.getUser = getUser;
module.exports.onboardSell = onboardSell;
module.exports.getUserOnboarding = getUserOnboarding;
module.exports.confirmBuy = confirmBuy;
module.exports.getUserById = getUserById;
module.exports.createBuy = createBuy;
module.exports.addTransaction = addTransaction;
module.exports.defend = defend;
module.exports.isDefendedTrue = isDefendedTrue;
module.exports.addSell = addSell;
module.exports.updateGladiatorId = updateGladiatorId;
module.exports.getSell = getSell;
module.exports.updateSellPayment = updateSellPayment;
module.exports.updateSellPrice = updateSellPrice;
module.exports.getAllSells = getAllSells;
module.exports.updateUserConfirmation = updateUserConfirmation;
module.exports.updateBuyToSell = updateBuyToSell;
module.exports.getSellRecognition = getSellRecognition;
module.exports.updatePaymentTxId = updatePaymentTxId;
module.exports.removeRecognition = removeRecognition;
module.exports.getPayments = getPayments;
module.exports.updateSellIsBalance = updateSellIsBalance;
module.exports.addRecognition = addRecognition;
module.exports.getSeller = getSeller;
module.exports.getUserRecognition = getUserRecognition;
const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    sessionId: {
        type: String,
    },
    url: {
        type: String,
    },
    price: {
        type: Number,
    },
    gla: {
        type: String,
    },
    average: {
        type: Number,
    },
    isPool: {
        type: Boolean,
        default: false
    },
    txId: {
        type: String
    },
    deschel: {
        type: String
    },
    isSold: {
        type: Boolean,
        default: false
    }
})
const Payment = mongoose.model('Payment', paymentSchema);

module.exports.paymentSchema = paymentSchema;
module.exports.Payment = Payment;
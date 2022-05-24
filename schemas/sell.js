const mongoose = require('mongoose');
const { transactionSchema } = require('./transaction');
const { paymentSchema } = require('./payment');
const sellSchema = new mongoose.Schema({
    liber: {
        type: Boolean,
        required: true
    },
    private: {
        type: String,
        required: true
    },
    public: {
        type: String,
        required: true
    },
    isBalance: {
        type: Boolean,
        required: true,
        default: false
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        required: true,
        default: Date()
    },
    rationemId: {
        type: String, 
        required: true,
    },
    gladiatorId: {
        type: String,
    },
    price: Number,
    payments: [paymentSchema]
})
const Sell = mongoose.model('Sell', sellSchema);
module.exports.Sell = Sell;
module.exports.sellSchema = sellSchema;

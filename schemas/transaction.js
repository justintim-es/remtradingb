const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: new Date(),
        required: true
    }
})
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports.Transaction = Transaction;
module.exports.transactionSchema = transactionSchema;
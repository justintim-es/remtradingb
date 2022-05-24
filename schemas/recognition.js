const mongoose = require('mongoose');

const recognitionSchema = new mongoose.Schema({
    delete: String,
    payout: String
});
const Recognition = mongoose.model('Recognition', recognitionSchema);

module.exports.recognitionSchema = recognitionSchema;
module.exports.Recognition = Recognition;
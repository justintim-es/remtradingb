const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ketuf:YwnYVDGQyWZkvTV4@cluster0.thilg.mongodb.net/trade?retryWrites=true&w=majority').then(() => console.log('mongoconnecteded'))
app.use(express.json());

const create = require('./routs/create');
const login = require('./routs/login');
const wallet = require('./routs/wallet');
const transfer = require('./routs/transfer');
const sell = require('./routs/sell');
const block = require('./routs/block');
const buy = require('./routs/buy');
const payed = require('./routs/payed');
const payout = require('./routs/payout');
app.use(cors());
app.use('/api/create', create);
app.use('/api/login', login);
app.use('/api/wallet', wallet);
app.use('/api/transfer', transfer);
app.use('/api/sell', sell);
app.use('/api/block', block);
app.use('/api/buy', buy);
app.use('/api/payed', payed);
app.use('/api/payout', payout);
app.listen(3000, () => console.log('listening'));

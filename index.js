const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ketuf:YwnYVDGQyWZkvTV4@cluster0.thilg.mongodb.net/buy?retryWrites=true&w=majority').then(() => console.log('mongoconnecteded'))
app.use(express.json());

const create = require('./routs/create');
const login = require('./routs/login');
app.use(cors());
app.use('/api/create', create);
app.use('/api/login', login);
app.listen(3000, () => console.log('listening'));

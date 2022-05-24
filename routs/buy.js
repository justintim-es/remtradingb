const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAllSells } = require('../schemas/user');
const _ = require('lodash');
// return res.send(_.map(sorted, u => ({
//     ..._.pick(u, ['_id', 'liber', 'isBalance', 'isActive', 'gla', 'rationemId', 'public']),
//     payment: _.pick(_.last(u.payments), ['price', 'average'])
// })));
router.get('/liber-price', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells.filter(s => s.liber), s => ({
            ..._.pick(s, ['rationemId']),
            payment: s.payments.length > 0 ? _.pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price']) : null
        })),
        'payment.price'
    ));
});
router.get('/liber-average', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells.filter(s => s.liber), s => ({
            ..._.pick(s, ['rationemId']),
            payment: _.pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price'])
        })),
        'payment.average'
    ));
});
router.get('/liber-gla', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells, s => ({
            ..._.pick(s, ['rationemId']),
            payment: s.payments.filter(p => !p.isSold).length > 0  ?_ .pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price']) : null
        })),
        'payment.gla'
    ));
});
router.get('/fixum-price', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells.filter(s => !s.liber), s => ({
            ..._.pick(s, ['rationemId']),
            payment: _.pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price'])
        })),
        'payment.price'
    ));
});
router.get('/fixum-average', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells.filter(s => !s.liber), s => ({
            ..._.pick(s, ['rationemId']),
            payment: _.pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price'])
        })),
        'payment.average'
    ));
});
router.get('/fixum-gla', auth, async (req, res) => {
    const sells = await getAllSells();
    return res.send(_.orderBy(
        _.map(sells.filter(s => !s.liber), s => ({
            ..._.pick(s, ['rationemId']),
            payment: _.pick(_.last(s.payments.filter(p => !p.isSold)), ['url', 'average', 'gla', 'price'])
        })),
        'payment.gla'
    ));
});

module.exports = router;
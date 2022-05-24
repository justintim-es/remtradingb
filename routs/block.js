const express = require('express');
const router = express.Router();
const Joi = require('joi');
const axios = require('axios');
const { getUserById } = require('../schemas/user');
const auth = require('../middleware/auth');
const { glaurl } = require('../constants');
const probationemsSchema = Joi.object({
    firstIndex: Joi.array().required(),
    lastIndex: Joi.array().required(),
    rationemIndex: Joi.number().required()
});
router.post('/your-bid', auth, async (req, res) => {
    const result = probationemsSchema.validate(req.body);
    if(result.error) return res.status(400).send('Invalid body');
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/probationems`, {
        firstIndex: req.body.firstIndex,
        lastIndex: req.body.lastIndex,
    }).then(async aresp => {
        let liberDeschefs = [];
        let fixumDeschefs = [];
        for (let i = 0; i < aresp.data.length; i++) {
            await axios.get(`${glaurl}/probationem-generare/${aresp.data[i]}`).then(async arespg => {
                if (arespg.data.generare == "EFECTUS" || arespg.data.generare == "INCIPIO") {
                    await axios.all([
                        axios.get(`${glaurl}/your-bid-defensio/true/${req.body.rationemIndex}/${aresp.data[i]}/${user.gladiatorId}`),
                        axios.get(`${glaurl}/your-bid-defensio/false/${req.body.rationemIndex}/${aresp.data[i]}/${user.gladiatorId}`)
                    ]).then(res => {
                        liberDeschefs.push(res[0].data);
                        fixumDeschefs.push(res[1].data);
                    })
                }
            })
        }
        return res.send({
            liberDefences: deschefs.sort((a, b) => b.yourBid - a.yourBid),
            fixumDefences: deschefs.sort((a, b) => b.yourBid - a.yourBid)
        });
    }).catch(err => res.status(400).send(err.response?.data))
})
router.post('/other-bid', auth, async (req, res) => {
    const result = probationemsSchema.validate(req.body);
    if(result.error) return res.status(400).send('Invalid body');
    const user = await getUserById(req.id);
    console.log(req.body);
    axios.post(`${glaurl}/probationems`, {
        firstIndex: req.body.firstIndex,
        lastIndex: req.body.lastIndex
    }).then(async aresp => {
        let liberDeschefs = [];
        let fixumDeschefs = [];
        for (let i = 0; i < aresp.data.length; i++) {
            await axios.get(`${glaurl}/probationem-generare/${aresp.data[i]}`).then(async arespg => {
                if (arespg.data.generare == 'EFECTUS' || arespg.data.generare == "INCIPIO") {
                    await axios.all([
                        axios.get(`${glaurl}/summa-bid-defensio/true/${req.body.rationemIndex}/${aresp.data[i]}`),
                        axios.get(`${glaurl}/summa-bid-defensio/false/${req.body.rationemIndex}/${aresp.data[i]}`)
                    ]).then(aressbd => {
                        liberDeschefs.push(aressbd[0].data);
                        fixumDeschefs.push(aressbd[1].data);
                    }).catch(err => {
                        console.log(err);
                        return res.status(400).send()
                    })
                }
            })
        }
        return res.send({
            liberDefences: liberDeschefs.sort((a, b) => a.summaBid - b.summaBid), 
            fixumDefences: fixumDeschefs.sort((a, b) => a.summaBid - b.summaBid)
        });
    }).catch(err => {
        console.log(err);
        res.status(400).send(err.response?.data)
    })
});
router.get('/your-bid/:liber/:index/:probationem', auth, async (req, res) => {
    const user = await getUserById(req.id);
    console.log(user);
    axios.get(`${glaurl}/your-bid-defensio/${req.params.liber}/${req.params.index}/${req.params.probationem}/${user.gladiatorId}`).then(async aresybd => {
        return res.send(aresybd.data);
    }).catch(err => res.status(400).send(err.response?.data))
});
router.get('/other-bid/:liber/:index/:probationem', auth, async (req, res) => {
    axios.get(`${glaurl}/summa-bid-defensio/${req.params.liber}/${req.params.index}/${req.params.probationem}`).then(async aressbd => {
        return res.send(aressbd.data);
    }).catch(err => res.status(400).send(err.response?.data));
})
router.get('/number', auth, async (req, res) => {
    axios.get(`${glaurl}/obstructionum-numerus`).then(areson => {
        return res.send(areson.data);
    }).catch(err => res.status(400).send())
})
module.exports = router;
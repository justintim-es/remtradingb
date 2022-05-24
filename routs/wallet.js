const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserById, IsDefendedTrue, defend, updateGladiatorId } = require('../schemas/user');
const _ = require('lodash');
const axios = require('axios');
const { glaurl } = require('../constants');

router.get('/balance', auth, async (req, res) => {
  console.log('balanace');
    const user = await getUserById(req.id);
    axios.all([
        axios.get(`${glaurl}/liber-statera/${user.public}`),
        axios.get(`${glaurl}/fixum-statera/${user.public}`)
    ]).then(resp => {
        console.log('balance resp')
        return res.send({
            liber: resp[0].data.statera,
            fixum: resp[1].data.statera
        });
    }).catch(err =>  {
        return res.status(400).send(err.response?.data)
    });
});
router.get('/liber-balance/:public', auth, async (req, res) => {
    console.log('baschal', req.params.public);
    axios.get(`${glaurl}/liber-statera/${req.params.public}`)
    .then(aresls => {
        console.log(aresls.data);
        return res.send({ statera: aresls.data.statera })
    })
    .catch(err => {
        console.log(err);
        return res.status(400).send(err.response?.data);
    });
});
router.post('/defend', auth, async (req, res) => {
    const user = await getUserById(req.id);
    axios.post(`${glaurl}/submittere-rationem`, {
        publicaClavis: user.public
    }).then(async ares => {
        console.log(ares.data);
        await defend(req.id, ares.data.propterIdentitatis);
        return res.send();
    }).catch(err => res.status(400).send())
});
router.get('/is-defended', auth, async (req, res) => {
    const user = await getUserById(req.id);
    if(user.rationemId) {
        axios.get(`${glaurl}/rationem/${user.rationemId}`).then(async ares => {
          if(ares.data.data.includi) {
            await updateGladiatorId(req.id, ares.data.gladiatorId, ares.data.index);
            return res.send({ message: 'send', rationem: ares.data });
          } else {
            return res.send({ message: 'status', rationem: ares.data });
          }
        }).catch(err => {
          console.log(err);
          return res.status(400).send({ message: err.response?.data.message });
        })
    } else {
        return res.send({ message: 'defend' });
    }
})
router.get('/base-defensio/:index/:gladiator', auth, async (req, res) => {
    axios.get(`${glaurl}/basis-defensiones/${req.params.index}/${req.params.gladiator}`).then(ares => {
        return res.send(ares.data.defensio)
    }).catch(err => res.status(400).send(err.english))
})
router.get('/defensiones/:liber/:index/:gladiator', auth, async (req, res) => {
    const gladiator = req.params.gladiator;
    const liber = req.params.liber;
    const index = req.params.index;
    axios.get(`${glaurl}/defensiones/${liber}/${index}/${gladiator}`).then(async aresd => {
        let deschefs = [];
        console.log('1');
        for (let i = 0; i < aresd.data.length; i++) {
            await axios.get(`${glaurl}/your-bid-defensio/${liber}/${index}/${aresd.data[i].probationem}/${gladiator}`).then(aresybd => {
                deschefs.push({ defence: aresybd.data.defensio, bid: aresybd.data.yourBid });
            }).catch(err => {
                console.log(err);
                return res.status(400).send(err)
            });
        }
        return res.send(deschefs);
    }).catch(err => {
        console.log(err);
        res.status(400).send(err.response?.data)
    });
});
router.get('/base', auth, async (req, res) => {
    const user = await getUserById(req.id);
    return res.send(_.pick(user, ['public', 'gladiatorId']))
});
module.exports = router;
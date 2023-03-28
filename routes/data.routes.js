const router = require("express").Router()
const data = require("../controllers/data.controller")

router.get('/expoData', data.fetchExpoData)

module.exports = router;

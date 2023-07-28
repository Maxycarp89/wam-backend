const express = require('express')
const router = express.Router()
const botRoutes = require("./botRoutes")
const userRoutes = require("./userRoutes")
const campaingRoutes = require("./campaingRoutes")
/*router.use('/', (req,res)=>{    
    res.send({ status: 'Ok', result: `llegaste al index en route` })
})*/


router.use('/', botRoutes)
router.use('/', userRoutes)
router.use('/', campaingRoutes)

module.exports = router





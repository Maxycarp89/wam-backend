const express = require("express");
const { editCampaing, getCampaingId,deleteCampaing} = require("../controllers/campaingControllers");

const router = express.Router();


router.get('/getCampaing/:id', getCampaingId);
router.post('/editCampaing', editCampaing);
router.delete('/delete', deleteCampaing);




module.exports = router;

const express = require("express");
const router = express.Router();
//require("../controllers/messages")
//const { , uploadImage, getMessages, sendCampaing } = require('../controllers')
const { sendMessages, uploadImage,sendCampaing,getDictionary } = require("../controllers");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("file=<<<<<<<",file);
        cb(null, "public");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// POST DATA
router.post("/sendMessages", sendMessages);
router.post('/sendCampaing', sendCampaing)
router.post("/uploadImage", upload.single("file"), uploadImage);

//router.use('/', upload.single('file'), uploadImage)

// GET DATA
router.get('/numberDictionary', getDictionary)

module.exports = router;

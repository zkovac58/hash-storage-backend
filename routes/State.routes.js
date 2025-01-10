const express = require("express");
const {storeState, getState} = require("../controllers/StateController.js");

const router = express.Router();

router.post("/:id", storeState);
router.get("/:id/:hash?", getState);

module.exports = router;
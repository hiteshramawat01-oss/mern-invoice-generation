const express = require("express");
const { getBusiness, updateBusiness } = require("../controllers/business.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);
router.get("/", getBusiness);
router.put("/", updateBusiness);

module.exports = router;

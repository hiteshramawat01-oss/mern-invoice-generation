const express = require("express");
const { getUsers, toggleUser, getStats } = require("../controllers/admin.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUser);
router.get("/stats", getStats);

module.exports = router;

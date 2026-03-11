const express = require("express");
const { getItems, createItem, updateItem, deleteItem } = require("../controllers/item.controller");
const { protect, adminOnly } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", protect, getItems);
router.post("/", protect, adminOnly, createItem);
router.put("/:id", protect, adminOnly, updateItem);
router.delete("/:id", protect, adminOnly, deleteItem);

module.exports = router;

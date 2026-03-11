const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { protect } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(protect);

// Get all customers
router.get("/", customerController.getAll);

// Get single customer
router.get("/:id", customerController.getOne);

// Create customer
router.post("/", customerController.create);

// Update customer
router.put("/:id", customerController.update);

// Delete customer
router.delete("/:id", customerController.delete);

module.exports = router;

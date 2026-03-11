const express = require("express");
const {
  getInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice, getNextNumber,
} = require("../controllers/invoice.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

router.get("/next-number", getNextNumber);
router.get("/", getInvoices);
router.get("/:id", getInvoice);
router.post("/", createInvoice);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

module.exports = router;

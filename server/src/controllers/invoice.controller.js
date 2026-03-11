const Invoice = require("../models/Invoice");

// GET /api/invoices
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .select("-__v")
      .sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (err) {
    res.status(500).json({ error: "Failed to get invoices" });
  }
};

// GET /api/invoices/:id
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ error: "Failed to get invoice" });
  }
};

// POST /api/invoices
exports.createInvoice = async (req, res) => {
  try {
    const {
      invoiceNumber, date, shopName, shopAddress, shopPhone, shopEmail,
      paymentUPI, paymentInfo, paymentQRCode,
      customerName, customerAddress, customerPhone,
      items, taxRate, notes,
    } = req.body;

    if (!customerName || !items || items.length === 0) {
      return res.status(400).json({ error: "Customer name and at least one item are required" });
    }

    // Check for duplicate invoice number for this user
    const existing = await Invoice.findOne({ user: req.user._id, invoiceNumber });
    if (existing) {
      return res.status(400).json({ error: `Invoice number ${invoiceNumber} already exists` });
    }

    const invoice = await Invoice.create({
      user: req.user._id,
      invoiceNumber, date, shopName, shopAddress, shopPhone, shopEmail,
      paymentUPI, paymentInfo, paymentQRCode,
      customerName, customerAddress, customerPhone,
      items, taxRate: taxRate || 0, notes: notes || "",
    });

    res.status(201).json({ invoice });
  } catch (err) {
    console.error("Create invoice error:", err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
};

// PUT /api/invoices/:id
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ invoice });
  } catch (err) {
    res.status(500).json({ error: "Failed to update invoice" });
  }
};

// DELETE /api/invoices/:id
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json({ message: "Invoice deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete invoice" });
  }
};

// GET /api/invoices/next-number  — returns next invoice number for this user
exports.getNextNumber = async (req, res) => {
  try {
    const lastInvoice = await Invoice.findOne({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("invoiceNumber");

    let nextNumber = "INV-001";
    if (lastInvoice) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        const next = parseInt(match[1]) + 1;
        nextNumber = `INV-${String(next).padStart(3, "0")}`;
      }
    }
    res.json({ nextNumber });
  } catch (err) {
    res.status(500).json({ error: "Failed to get next invoice number" });
  }
};

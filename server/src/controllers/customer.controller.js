const Customer = require("../models/Customer");

// GET all customers for a user
exports.getAll = async (req, res) => {
  try {
    const customers = await Customer.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ customers });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
};

// GET single customer
exports.getOne = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ customer });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
};

// CREATE customer
exports.create = async (req, res) => {
  try {
    const { name, email, phone, address, notes } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const customer = await Customer.create({
      user: req.user._id,
      name,
      email,
      phone,
      address,
      notes,
    });

    res.status(201).json({ customer });
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).json({ error: "Failed to create customer" });
  }
};

// UPDATE customer
exports.update = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ customer });
  } catch (err) {
    console.error("Error updating customer:", err);
    res.status(500).json({ error: "Failed to update customer" });
  }
};

// DELETE customer
exports.delete = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.json({ message: "Customer deleted" });
  } catch (err) {
    console.error("Error deleting customer:", err);
    res.status(500).json({ error: "Failed to delete customer" });
  }
};

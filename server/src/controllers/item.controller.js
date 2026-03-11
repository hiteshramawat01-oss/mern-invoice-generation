const MasterItem = require("../models/MasterItem");

// GET /api/items  (all users can read)
exports.getItems = async (req, res) => {
  try {
    const items = await MasterItem.find({ isActive: true }).sort({ name: 1 });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: "Failed to get items" });
  }
};

// POST /api/items  (admin only)
exports.createItem = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Name and price are required" });
    }
    const item = await MasterItem.create({ name, price, description });
    res.status(201).json({ item });
  } catch (err) {
    res.status(500).json({ error: "Failed to create item" });
  }
};

// PUT /api/items/:id  (admin only)
exports.updateItem = async (req, res) => {
  try {
    const item = await MasterItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ item });
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// DELETE /api/items/:id  (admin only)
exports.deleteItem = async (req, res) => {
  try {
    const item = await MasterItem.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete item" });
  }
};

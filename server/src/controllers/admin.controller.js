const User = require("../models/User");
const Invoice = require("../models/Invoice");

// GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).sort({ createdAt: -1 });

    // Get invoice counts per user
    const counts = await Invoice.aggregate([
      { $group: { _id: "$user", count: { $sum: 1 } } },
    ]);
    const countMap = {};
    counts.forEach((c) => {
      countMap[c._id.toString()] = c.count;
    });

    const result = users.map((u) => ({
      id: u._id,
      email: u.email,
      isActive: u.isActive,
      createdAt: u.createdAt,
      invoiceCount: countMap[u._id.toString()] || 0,
    }));

    res.json({ users: result });
  } catch (err) {
    res.status(500).json({ error: "Failed to get users" });
  }
};

// PUT /api/admin/users/:id/toggle
exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user: { id: user._id, email: user.email, isActive: user.isActive } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalInvoices] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Invoice.countDocuments(),
    ]);
    res.json({ totalUsers, totalInvoices });
  } catch (err) {
    res.status(500).json({ error: "Failed to get stats" });
  }
};

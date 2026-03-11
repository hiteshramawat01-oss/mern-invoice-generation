const Business = require("../models/Business");

// GET /api/business
exports.getBusiness = async (req, res) => {
  try {
    let business = await Business.findOne({ user: req.user._id });
    if (!business) {
      business = await Business.create({ user: req.user._id });
    }
    res.json({ business });
  } catch (err) {
    res.status(500).json({ error: "Failed to get business details" });
  }
};

// PUT /api/business
exports.updateBusiness = async (req, res) => {
  try {
    const allowed = [
      "shopName", "shopAddress", "shopPhone", "shopEmail",
      "paymentUPI", "paymentInfo", "paymentQRCode", "logo", "brandColor",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const business = await Business.findOneAndUpdate(
      { user: req.user._id },
      updates,
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ business });
  } catch (err) {
    res.status(500).json({ error: "Failed to update business details" });
  }
};

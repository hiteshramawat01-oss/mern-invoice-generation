const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    shopName: { type: String, default: "" },
    shopAddress: { type: String, default: "" },
    shopPhone: { type: String, default: "" },
    shopEmail: { type: String, default: "" },
    paymentUPI: { type: String, default: "" },
    paymentInfo: { type: String, default: "" },
    paymentQRCode: { type: String, default: "" }, // base64
    logo: { type: String, default: "" },          // base64
    brandColor: { type: String, default: "#3b82f6" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", businessSchema);

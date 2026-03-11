const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
});

const invoiceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    // Business snapshot at time of invoice
    shopName: { type: String, default: "" },
    shopAddress: { type: String, default: "" },
    shopPhone: { type: String, default: "" },
    shopEmail: { type: String, default: "" },
    paymentUPI: { type: String, default: "" },
    paymentInfo: { type: String, default: "" },
    paymentQRCode: { type: String, default: "" },
    // Customer
    customerName: { type: String, required: true },
    customerAddress: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    // Line items
    items: [invoiceItemSchema],
    taxRate: { type: Number, default: 0 },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Compound unique index: one invoice number per user
invoiceSchema.index({ user: 1, invoiceNumber: 1 }, { unique: true });

// Virtual: subtotal
invoiceSchema.virtual("subtotal").get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
});

// Virtual: total
invoiceSchema.virtual("total").get(function () {
  const sub = this.subtotal;
  return sub + sub * (this.taxRate / 100);
});

invoiceSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Invoice", invoiceSchema);

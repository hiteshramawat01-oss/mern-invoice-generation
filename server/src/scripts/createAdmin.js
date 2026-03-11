/**
 * Run this once to create the admin user:
 *   node src/scripts/createAdmin.js
 *
 * Set ADMIN_EMAIL and ADMIN_PASSWORD env vars or edit defaults below.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@invoiceapp.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@1234";

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`✅ Existing user ${ADMIN_EMAIL} upgraded to admin`);
    } else {
      console.log(`ℹ️  Admin ${ADMIN_EMAIL} already exists`);
    }
  } else {
    await User.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" });
    console.log(`✅ Admin created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

createAdmin().catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});

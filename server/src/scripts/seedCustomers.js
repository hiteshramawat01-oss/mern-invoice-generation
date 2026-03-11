/**
 * Seed dummy customers:
 *   node src/scripts/seedCustomers.js
 * 
 * Creates 10 dummy customers in the database for testing
 */
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const Customer = require("../models/Customer");

const dummyCustomers = [
  { name: "Raj Patel", email: "raj@example.com", phone: "+91 98765 43210", address: "123 Main St, Mumbai" },
  { name: "Priya Singh", email: "priya@example.com", phone: "+91 98765 43211", address: "456 Oak Ave, Delhi" },
  { name: "Amit Kumar", email: "amit@example.com", phone: "+91 98765 43212", address: "789 Elm St, Bangalore" },
  { name: "Neha Sharma", email: "neha@example.com", phone: "+91 98765 43213", address: "321 Pine Rd, Hyderabad" },
  { name: "Rohan Gupta", email: "rohan@example.com", phone: "+91 98765 43214", address: "654 Maple Dr, Pune" },
  { name: "Anjali Verma", email: "anjali@example.com", phone: "+91 98765 43215", address: "987 Cedar Ln, Chennai" },
  { name: "Vikram Yadav", email: "vikram@example.com", phone: "+91 98765 43216", address: "147 Birch St, Kolkata" },
  { name: "Sneha Desai", email: "sneha@example.com", phone: "+91 98765 43217", address: "258 Spruce Ave, Ahmedabad" },
  { name: "Sanjay Nair", email: "sanjay@example.com", phone: "+91 98765 43218", address: "369 Ash Blvd, Jaipur" },
  { name: "Divya Reddy", email: "divya@example.com", phone: "+91 98765 43219", address: "741 Willow Way, Lucknow" },
];

async function seedCustomers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get the first admin user (or any user)
    const user = await User.findOne({ role: "admin" }).select("_id");
    if (!user) {
      console.log("❌ No admin user found. Please create an admin user first using: node src/scripts/createAdmin.js");
      process.exit(1);
    }

    // Clear existing customers for this user
    await Customer.deleteMany({ user: user._id });
    console.log("🗑️  Cleared existing customers");

    // Create dummy customers
    const customersToCreate = dummyCustomers.map(customer => ({
      ...customer,
      user: user._id,
    }));

    const created = await Customer.insertMany(customersToCreate);
    console.log(`✅ Created ${created.length} dummy customers for admin user (${user._id})`);

    // Display created customers
    console.log("\n📋 Created Customers:");
    created.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.phone})`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedCustomers();

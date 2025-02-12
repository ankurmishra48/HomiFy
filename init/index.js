const mongoose = require("mongoose"); 
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => console.log("✅ Connected to DB"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // ✅ Delete all existing listings first

  initData.data= initData.data.map((obj) => ({
    ...obj,
    owner:"67ac8fe48299968dcd5b696b" // ✅ Ensure ObjectId format
  }));

  await Listing.insertMany(initData.data);
  console.log("🎉 Database initialized with owner field!");
};

initDB();

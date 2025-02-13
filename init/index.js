require('dotenv').config({ path: '../.env' }); 

console.log(" Loaded MongoDB URL:", process.env.AtlasDbUrl); 

const mongoose = require("mongoose"); 
const initData = require("./data.js");
const Listing = require("../models/listing.js");

//const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";

const dbUrl = process.env.AtlasDbUrl;

if (!dbUrl) {
    console.error("Missing MongoDB Atlas URL in .env file");
    process.exit(1);
}

async function main() {
  try {
      await mongoose.connect(dbUrl, {
          serverSelectionTimeoutMS: 5000, 
      });
      console.log("Connected to MongoDB Atlas");
  } catch (error) {
      console.error("MongoDB Connection Error:", error);
      process.exit(1);
  }
}

const initDB = async () => {
  try {
      console.log("Deleting existing listings...");
      const deleted = await Listing.deleteMany({});
      console.log(`Deleted ${deleted.deletedCount} listings.`);

      initData.data = initData.data.map((obj) => ({
          ...obj,
          owner: "67acdc24f10dabd57b5a3f56"
      }));

      await Listing.insertMany(initData.data);
      console.log(" Database initialized successfully!");

  } catch (error) {
      console.error(" Error initializing database:", error);
  } finally {
      mongoose.connection.close();
      console.log(" Disconnected from MongoDB Atlas");
  }
};

//Run main() first, then initDB()
main().then(initDB);

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  image: {
    filename: String,
    url: String,
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "review",
    },
  ],
  owner: { 
    type: Schema.Types.ObjectId, 
    ref: "User" // ✅ Ensure this references "User"
  },
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

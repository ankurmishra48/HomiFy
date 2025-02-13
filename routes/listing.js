const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { listingSchema, reviewSchema } = require("../Schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing"); // Adjusted path to match project structure
const { isLoggedin, isOwner } = require("../middleware.js");

// ✅ Fixed Validation Middleware
const validatelisting = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
      let errmsg = error.details.map((el) => el.message).join(",");
      return next(new ExpressError(400, errmsg));  // ✅ Pass error to error handler
  }
  next();
};

// ✅ Show All Listings
router.get("/", async (req, res) => {
    try {
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    } catch (err) {
        console.error("Error fetching listings:", err);
        res.status(500).send("Internal Server Error");
    }
});

// ✅ Show Create Form
router.get("/new", isLoggedin, (req, res) => {
    res.render("listings/new");
});

// ✅ Show Single Listing
router.get("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate('reviews').populate('owner');

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings"); // 🔴 Fix: Added "return" to prevent double response
    }

    console.log(listing);
    res.render("listings/show.ejs", { listing });
}));

// ✅ Create Listing
router.post("/", isLoggedin, validatelisting, wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash('success', 'New listing created');
    res.redirect("/listings");
}));

// ✅ Show Edit Form
router.get("/:id/edit", isLoggedin, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");

    if (!listing) {
        req.flash("error", "Listing you requested does not exist");
        return res.redirect("/listings"); // 🔴 Fix: Added "return" to prevent double response
    }

    res.render("listings/edit", { listing });
}));

// ✅ Update Listing
router.put("/:id", isLoggedin, isOwner, validatelisting, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}));

// ✅ Delete Listing
router.delete("/:id", isLoggedin, isOwner, wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success', 'Listing deleted');
    res.redirect("/listings");
}));

module.exports = router;

const Listing = require("./models/listing"); 
module.exports.isLoggedin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; // Store the page user wanted to access
        req.flash("error", "You must be logged in to access this page.");
        return res.redirect("/login");
    }
    next();
};



module.exports.saveredirectUrl = (req, res, next) => {
    res.locals.redirectUrl = req.session.redirectUrl || "/listings"; // Default to /listings
    delete req.session.redirectUrl; // Clear session after retrieving URL
    next();
};
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing.owner.equals(res.locals.curUser._id)) {
        req.flash("error", "You are not a owner of this listing");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const userrouter = require("./routes/userrouter.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User.js");
require("dotenv").config();
const Listing = require("./models/listing.js");

const app = express();
const PORT = 3000;

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

// Connect to MongoDB
const dbUrl = process.env.AtlasDbUrl;

mongoose
  .connect(dbUrl, { useNewUrlParser: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// Set View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware: Static Files, URL Parsing, and Method Override
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true })); // Ensure this is before routes
app.use(methodOverride("_method"));

const store = MongoStore.create({
  mongoUrl: dbUrl,
  dbName: "wanderlust", // Specify your actual DB name
  crypto: {
    secret: process.env.SECRET, // Encryption for security
  },
  touchAfter: 24 * 3600, // Reduce unnecessary session updates
});

// Fix: Properly handle MongoDB session store errors
store.on("error", (err) => {
  console.log("Error in Mongo session store:", err);
});

// Session Configuration
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Fix: Changed `secure: true` to `false`
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration (Move Above Routes)
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware (Must Be Above Routes)
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.curUser = req.user;
  next();
});

// Routes
app.use("/listings", listings);
app.use("/reviews", reviews); // Fix: Removed `:id` to prevent route conflicts
app.use("/", userrouter);

// Home Route
app.get("/", async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Handle 404 Errors
app.all("*", (req, res) => {
  res.status(404).render("errors/404", { message: "Page Not Found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!err.status) err.status = 500;
  if (!err.message) err.message = "Something went wrong!";

  res.status(err.status);
  res.render("errors/error", { err });
});



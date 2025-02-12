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
const MongoStore=require('connect-mongo')
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User.js");
require('dotenv').config();
const Listing = require("../models/listing");
const app = express();
const PORT = 3000;

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Connect to MongoDB
//const mongoURL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl=process.env.AtlasDbUrl

mongoose.connect(process.env.AtlasDbUrl, {
  useNewUrlParser: true
})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(" MongoDB Connection Error:", err));

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
  dbName: "dbUrl", // Optional: Specify your DB name
  crypto: {
    secret: process.env.SECRET, // Encryption for security
  },
  touchAfter: 24 * 3600, // Reduce unnecessary session updates
});
  
  store.on('error',()=>{
    console.log('error in mongo session',err)
  })

// Session Configuration
const sessionOptions = {
  store,
  secret:process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Fix: Change `secure: true` to `false`
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
  res.locals.curUser=req.user
  next();
});

// Routes
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
app.use("/", userrouter);
app.get("/", async (req, res) => {
  try {
      const allListings = await Listing.find({}); // Fetch listings from MongoDB
      res.render("index", { allListings }); // Pass listings to EJS template
  } catch (err) {
      console.error("Error fetching listings:", err);
      res.status(500).send("Internal Server Error");
  }
});
 

// Handle 404 Errors
app.get("*", (req, res, next) => {
  req.flash('error','Page not found ')
  next(new ExpressError(404, "Page Not Found"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Internal Server Error" } = err;
  console.error(err.stack);
  res.status(statusCode).send(message);
});

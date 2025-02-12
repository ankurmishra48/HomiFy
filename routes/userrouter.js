const express=require("express")
const router= express.Router()
const User=require("../models/User.js")
const wrapAsync=require("../utils/wrapAsync.js")
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy;
const {saveredirectUrl}=require('../middleware.js')
 


router.get('/signup',(req,res)=>{
res.render('Users/signup.ejs');
})
router.post('/signup', wrapAsync(async (req, res, next) => {
    try {
        console.log("Received signup request:", req.body); // Debugging log

        let { username, email, password } = req.body;
        const newUser = new User({ email, username });

        const registeredUser = await User.register(newUser, password);
        console.log("User registered:", registeredUser);
       
        req.login(registeredUser,(err)=>{
            if(err){
              return next(err)
            }
            req.flash("success", "Welcome to wanderlust! User was registered");
        res.redirect("/listings");
        })         

    } catch (err) {
        console.error("Signup error:", err.message);
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));


router.get('/login',(req,res)=>{
    res.render('Users/login.ejs');
    })

    router.post(
        "/login",
        saveredirectUrl, // Ensure redirect URL is saved before authentication
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true,
        }),
        async (req, res) => {
            req.flash("success", "Welcome to Wanderlust! You are logged in.");
            let redirectUrl = res.locals.redirectUrl || "/listings"; // Use stored URL or fallback
            res.redirect(redirectUrl);
        }
    );
    
    

// let redirectUrl=res.locals.redirectUrl||'/listings'
// res.redirect(redirectUrl)
// })

router.get('/logout',(req,res)=>{
    req.logout((err)=>{
        if(err){
            next(err)
        }
        req.flash('success','you are logout!');
        res.redirect("/listings")
    })
 
 
})


module.exports=router
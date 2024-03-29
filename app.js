require("dotenv").config();
const express = require("express");
const bp = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// mongoose.connect("mongodb://localhost:27017/userDB");
mongoose.connect("mongodb://127.0.0.1/userDB");
const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set("view engine", "ejs");
app.use(bp.urlencoded({extended : true}));
app.use(express.static("public"));

app.use(session({
    secret : "Our little tiny string and many more.",
    resave : false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

const userSchema = new mongoose.Schema({
    emial : String,
    password : String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model("user", userSchema);

passport.use(User.createStrategy());

// only for local:
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// for all:
passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
      cb(null, { id: user.id, username: user.username, name: user.name });
    });
});
  
passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
    res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get("/auth/google/secrets", 
passport.authenticate("google", { failureRedirect: "/login" }),
function(req, res) {
// Successful authentication, redirect secrets.
res.redirect("/secrets");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/secrets", function(req, res){
    // if (req.isAuthenticated())
    //     res.render("secrets");
    // else 
    //     res.redirect("/login");
    User.find({secret: {$ne: null}}, function(err, arr){
        if (! err){
            res.render("secrets", {secret_arr: arr});
        }
    });
});

app.get("/logout", function(req, res){
    req.logout(function(err){
        if (! err) res.redirect("/");
    });
});

app.get("/submit", function(req, res){
    res.render("submit");
});

app.post("/submit", function(req, res){
    const sec = req.body.secret;
    console.log(req.user);
    User.findById(req.user.id, function(err, ans){
        if (! err){
            if (ans){
                ans.secret = sec;
                ans.save(function(){
                    res.redirect("/secrets");
                });
            }
        }
    });
});

app.post("/login", function(req, res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });
    req.login(user, function(err){
        if (err) console.log(err);
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    const email = req.body.username;
    const pass = req.body.password;
    User.register({username : req.body.username}, req.body.password, function(err, user){
        if (err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(3000, function(){
    console.log("Running on 3000");
});
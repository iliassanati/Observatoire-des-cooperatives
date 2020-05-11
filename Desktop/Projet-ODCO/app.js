//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.static("public"));
// Passport Config

const LocalStrategy = require('passport-local').Strategy;

// Load User model
const UserSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  domaineActivite: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// Passport Config


  passport.use(
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        email: email
      }).then(user => {
        if (!user) {
          return done(null, false, { message: 'That email is not registered' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });


// DB Config
mongoose.connect("mongodb+srv://admin-odco:Admin-ODCO@cluster0-gnlog.mongodb.net/ODCODB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

  // EJS
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express body parser
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes

//home
app.get("/", function(req, res){
  res.render("home");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.get("/login", function(req, res){
  res.render("login");
})



// Register
app.post("/register", function(req, res) {

  const { nom, prenom, email, password, password2, domaineActivite, phoneNumber } = req.body;

  let errors = [];

  if (!nom || !prenom || !email || !password || !password2 || !domaineActivite || !phoneNumber) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (phoneNumber.length < 6) {
    errors.push({ msg: 'please enter a valid number' });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      nom,
      prenom,
      email,
      password,
      password2,
      domaineActivite,
      phoneNumber,
    });
  } else {

    User.findOne({ email: email }).then(function(user){
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          nom,
          prenom,
          email,
          password,
          password2,
          domaineActivite,
          phoneNumber,
        });
      } else {
        const newUser = new User({
          nom,
          prenom,
          email,
          password,
          domaineActivite,
          phoneNumber,
        });

        bcrypt.genSalt(10, function(err, salt){
          bcrypt.hash(newUser.password, salt, function(err, hash){
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(function(user){
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect("/login");
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login
app.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
app.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect("/login");
});


































































































// app.use(express.static("public"));
// app.set('view engine', 'ejs');
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
//
// app.use(session({
//   secret: "Our little secret.",
//   resave: false,
//   saveUninitialized: false
// }));
//
// app.use(passport.initialize());
// app.use(passport.session());
//
// mongoose.connect("mongodb+srv://admin-odco:Admin-ODCO@cluster0-gnlog.mongodb.net/ODCODB", {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.set("useCreateIndex", true);
//
// const utilisateurSchema = new mongoose.Schema ({
//   email: String,
//   password: String,
//   nom: Strin
// });
//
// utilisateurSchema.plugin(passportLocalMongoose);
//
// const Utilisateur = new mongoose.model("Utilisateur", utilisateurSchema);
//
// passport.use(Utilisateur.createStrategy());
//
// passport.serializeUser(Utilisateur.serializeUser());
// passport.deserializeUser(Utilisateur.deserializeUser());
//
// app.get("/", function(req, res){
//   res.render("home");
// });
//
// app.get("/login", function(req, res){
//   res.render("login");
// });
//
// app.get("/register", function(req, res){
//   res.render("register");
// });
//
// app.get("/secrets", function(req, res){
//   if (req.isAuthenticated()){
//     res.render("secrets");
//   } else {
//     res.redirect("/login");
//   }
// });
//
// app.get("/logout", function(req, res){
//   req.logout();
//   res.redirect("/");
// });
//
// app.post("/register", function(req, res){
//
//   Utilisateur.register({username: req.body.username}, req.body.password, function(err, user){
//     if (err) {
//       console.log(err);
//       res.redirect("/register");
//     } else {
//       passport.authenticate("local")(req, res, function(){
//         res.redirect("/secrets");
//       });
//     }
//   });
//
// });
//
// app.post("/login", function(req, res){
//
//   const utilisateur = new Utilisateur({
//     username: req.body.username,
//     password: req.body.password
//   });
//
//   req.login(utilisateur, function(err){
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate("local")(req, res, function(){
//         res.redirect("/secrets");
//       });
//     }
//   });
//
// });
//
//
//
//



app.listen(3000, function() {
  console.log("Server started on port 3000.");
});

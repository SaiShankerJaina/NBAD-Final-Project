const express = require("express");
const fs = require("fs");
const methodOverride = require("method-override");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const app = express();

const mainRoute = require("./routes/main");
const connectionRoute = require("./routes/connection");
const userRoute = require('./routes/user');

// set the view engine to ejs
app.set("view engine", "ejs");

// enabling styles/images to be served from public
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// database
mongoose
  .connect("mongodb://127.0.0.1:27017/NBAD", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    // starting the server
    app.listen(3000, () => {
      console.log("Stating server, Listening on port 3000");
    });
  })
  .catch((err) => {
    console.log("failed to connect database", err);
  });


// session middleware
app.use(session({
  secret: 'project4',
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge: 1000*60*60*24},
  store: MongoStore.create({
      mongoUrl: 'mongodb://127.0.0.1:27017/NBAD',
  })
}));

// flash middleware
app.use(flash());

// flash messages
app.use((req,res,next) => {
  
  res.locals.user= req.session.user||null;
  res.locals.username = req.session.username;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  console.log('Application level middleware', req.session);
  next();
})



// router modules
app.use("/", mainRoute);
app.use("/connections", connectionRoute);
app.use('/users', userRoute);


// error handling
app.use((req, res, next) => {
  let err = new Error("The server cannot locate " + req.url);
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (!err.status) {
    err.status = 500;
    err.message = "Internal Server Error";
  }
  res.status(err.status);
  res.render("error", { error: err });
});

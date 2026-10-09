const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const listingController = require("./controllers/listing.js");


app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsmate);
app.use(express.static(path.join(__dirname, "/public")));


const port = 8080;

// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
async function main() {
  await mongoose.connect(dbUrl);
}
main()
  .then(() => {
    console.log("Database connect succesfull✅✅");
  })
  .catch((err) => console.log(err));



// app.get("/", (req, res) => {
//   res.send("hi i am swapnil");
// });

const store = MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 3600, //lazy update
})

app.use(session({
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true
  }
}))


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
})

// Homepage route — YAHAN
app.get("/", listingController.index);

// Router mounting  necha wahi hai

//

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);




app.use("/listings", (req, res, next) => {
  next(new ExpressError(404, "Listing Not Found"));
});

// 404
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found ha"));
});

// ⬇️ SABHI ROUTES KE BAAD
// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  // res.status(status).send(message);
  res.status(status).render("error.ejs", { message });

  // res.status(500).send("Something went wrong!");
});

app.listen(port, () => {
  console.log("app is listining your port 🚀🚀");
});

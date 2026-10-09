const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");

module.exports.isLoggedIn = (req,res,next) => {
    // console.log("REQ.USER:", req.user);
    if(!req.isAuthenticated()){
        // console.log("ORIGINAL URL:", req.originalUrl);
        if (req.method !== "DELETE") { //yea ipura code hata sakta ho chatgpt se liya hai.
            req.session.redirectUrl = req.originalUrl;
        }
        // req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    next();
}

module.exports.savedRedirectUrl = (req,res,next) => {
    // console.log("BEFORE DELETE:", req.session.redirectUrl);
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl; // ye line mena extra likha hai taki redirect url delete ho jaye after use.
    }
    // console.log("AFTER DELETE:", req.session.redirectUrl);
    next();
}

module.exports.isOwner = async (req,res,next) => {
    const {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing.owner.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

// validtaion middleware server
module.exports.validationListing = (req, res, next) => {
  const result = listingSchema.validate(req.body);

  console.log("FULL RESULT:", result);
  console.log("DETAILS:", result.error?.details);
  // console.log("DETAILS:", result.error.details);

  if (result.error) {
    throw new ExpressError(400, result.error.message.replace("listing.", ""));
  } else {
    next();
  }
  // const { error } = listingSchema.validate(req.body);
  // if (error) {
  //   throw new ExpressError(404, error.message);
  // } else {
  //   next();
  // }
};

// validtaion middleware server --review
module.exports.validationReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  // console.log("REVIEW RESULT:", error);

  if (error) {
    throw new ExpressError(404, error.message.replace("review.", ""));
  } else {
    next();
  }
};

module.exports.isReviewOwner = async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
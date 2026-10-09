const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const {validationReview,isLoggedIn,isReviewOwner} = require("../middleware.js");
const ReviewController = require("../controllers/review.js");


// review
// post route for review
router.post(
  "/",
  isLoggedIn,
  validationReview,
  wrapAsync(ReviewController.createReview),
);
// delete route for review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewOwner,
  wrapAsync(ReviewController.destroyReview),
);

module.exports = router;
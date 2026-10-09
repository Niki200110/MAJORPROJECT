const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  let newreview = new Review(req.body.review);
  newreview.author = req.user._id;
  listing.reviews.push(newreview);

  await newreview.save();
  await listing.save();
  req.flash("success", "New review created!");
  res.redirect(`/listings/${id}`);
};

(module,
  (exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params;

    // 1. Review collection se delete
    await Review.findByIdAndDelete(reviewId);

    // 2. Listing ke reviews array se review ID remove
    await Listing.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });

    req.flash("success", "Review deleted!");
    res.redirect(`/listings/${id}`);
  }));

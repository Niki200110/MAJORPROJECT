const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ExpressError(404, "Listing Not Found");
  }
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } }) //nested populate for reviews and their authors
    .populate("owner");
  console.log(listing);
  if (!listing) {
    req.flash("error", "Listing not found hotel!");
    return res.redirect("/listings");
  }
  // if (!listing) {
  //   throw new ExpressError(404, "Listing Not Found-hotel");
  // }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send()

  const newlisting = new Listing(req.body.listing);
  // console.log("req.user:", req.user); // req.user is available because of passport.js
  newlisting.owner = req.user._id;
  
  newlisting.geometry = response.body.features[0].geometry; // Set the geometry field with the geocoded coordinates

  const url = req.file.path; // Get the path of the uploaded file
  const filename = req.file.filename; // Get the filename of the uploaded file
  console.log("FILE PATH:", req.file.path);
  console.log("FILE FILENAME:", req.file.filename);
  newlisting.image = { url, filename }; 
  await newlisting.save();
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing for edit not found!!");
    return res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  
  // 3. Location ko coordinates me convert karo
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  // 4. Geometry save karo
  listing.geometry = response.body.features[0].geometry;
  if (req.file) {
  const url = req.file.path;// Get the path of the uploaded file
  const filename = req.file.filename;

  listing.image = { url, filename };// Update the image field with the new file information
}
  await listing.save();
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing deleted!");
  res.redirect("/listings");
};

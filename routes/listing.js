if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validationListing } = require("../middleware.js");
const listingsController = require("../controllers/listing.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage }); // Configure multer to store uploaded files in the "uploads" directory

router
  .route("/")
  .get(wrapAsync(listingsController.index)) //index route for all data show
  .post(
    // create route jo form se ab data milyga  (CREATE)
    isLoggedIn,
    upload.single("listing[image]"), // Handle file upload for the "image" field
    validationListing,
    wrapAsync(listingsController.createListing),
  );


// create form for new listings(new routes(hotel))
router.get("/new", isLoggedIn, listingsController.renderNewForm);


router
  .route("/:id")
  .get( // show all data by id  (show routes{SHOW ROUTE})
  wrapAsync(listingsController.showListing))
  .put(// update route  (UPDATE)
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  wrapAsync(listingsController.updateListing),
 )
 .delete(// delete  (DELETE)
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.destroyListing),
);


// route for new form edit data  (EDIT)
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.editListing),
);


module.exports = router;

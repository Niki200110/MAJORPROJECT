const mongoose = require("mongoose");
const Listing = require("../models/listing.js")
const initdata = require("./data.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
async function main() {
    await mongoose.connect(MONGO_URL)
}
main()
.then(() => {
    console.log("Database connect succesfull✅✅")
}).catch(err => console.log(err))

const initdb = async() => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner: "6ac23555b2759a83c8191dc8"}));
    await Listing.insertMany(initdata.data)
    console.log("data was initialize")
}

initdb();
const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");

require("dotenv").config({ path: "./config.env" });
const port = process.env.PORT || 3000;

//-----MIDDLEWARE-----
let corsOptions = {
    origin: ["http://localhost"]
}

app.use(cors());
app.use(express.json());


// get driver connection
const uri = process.env.ATLAS_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const userRoutes = require("./routes/users");
const referralRoutes = require("./routes/referrals");
const jobListingRoutes = require("./routes/jobListings");

app.use('/users', userRoutes);
app.use('/referral',referralRoutes);
app.use('/jobListings',jobListingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
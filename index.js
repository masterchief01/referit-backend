const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require("mongoose");

require("dotenv").config();
const port = process.env.PORT || 3000;

//-----MIDDLEWARE-----
app.use(cors());
app.use(express.json());


// get driver connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("MongoDB database connection established successfully");
})

const userRoutes = require("./routes/users");
const referralRoutes = require("./routes/referrals");
const jobListingRoutes = require("./routes/jobListings");

app.use('/api/users', userRoutes);
app.use('/api/referral',referralRoutes);
app.use('/api/jobListings',jobListingRoutes);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
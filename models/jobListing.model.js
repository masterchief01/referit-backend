const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Companies = require("../data/companies");

const jobListingSchema = new Schema({
    company: {type: String, enum: Companies, required:true},
    datePosted: {type: Date, default: Date.now},
    isActive: {type: Boolean, required:true},
    jobId: {type: String},
    jobLink: {type: String},
    desc: {type: String},
    
    postedBy: {type: String},
    requested_referral: [new Schema({refInd:{type: Number, min:0}})],

    self: {type: Boolean}
});

const jobListingModel = mongoose.model('jobListings', jobListingSchema);
module.exports = jobListingModel;
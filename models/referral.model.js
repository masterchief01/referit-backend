const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Companies = require("../data/companies");

const companyReferralSchema = new Schema({

    candidate: {type: String},
    jobReference: {type: Schema.Types.ObjectId, ref: 'jobListings', required:true},
    datePosted: {type: Date, default: Date.now},
    isActive: {type: Boolean, required: true},

    rejectedBy: [new Schema({id:{type: String}})],

    nosRejected: {type: Number, default: 0}
})

const referralSchema = new Schema({
    key: {type: String, enum: Companies, unique:true, required:true},
    data:[companyReferralSchema]
});

const ReferralModel = mongoose.model('referrals', referralSchema);
module.exports = ReferralModel;
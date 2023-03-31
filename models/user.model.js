const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Companies = require("../data/companies");

const feedbackSchema = new Schema({
    givenBy: {type: String},
    jobRef: {type: Schema.Types.ObjectId, ref: 'jobs'},
    msg: {type: String},
    type: {type: String, enum: ['refer', 'reject', 'feedback']}
});

const userSchema = new Schema({
    user_id: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    isReferee: {type: Boolean, required:true},
    profile_pic: {type:String, required:true},

    infotext: {type: String},
    institute: {type: String},
    branch: {type: String},
    cgpa: {type: Number},
    linkedin: {type: String},
    github: {type: String},
    codechef: {type: String},
    codeforces: {type: String},
    resume_link: {type: String},
    graduating_year: {type: Number},
    phone_number: {type: String},

    current_company: {type: String, enum: Companies},
    infotext: {type: String},
    linkedin: {type: String},
    github: {type: String},
    leetcode: {type: String},
    work_experience: {type: Number},
    job_role: {type: String},
    phone_number: {type: String},

    jobs_posted: [new Schema({jobReference: {type: Schema.Types.ObjectId, ref: 'jobListings'}})],
    jobs_requested: [new Schema({jobReference: {type: Schema.Types.ObjectId, ref: 'jobListings'}})],
    referrals_feedback: [feedbackSchema]
});

const UserModel = mongoose.model('users', userSchema);
module.exports = UserModel;
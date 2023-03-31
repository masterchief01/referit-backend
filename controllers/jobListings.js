const { validationResult } = require("express-validator");

let Users = require('../models/user.model');
let Referrals = require('../models/referral.model');
let JobListings = require('../models/jobListing.model');

exports.postNewJob = async (req, res) => {
    try {
        let data = req.body;
        if (data.jobId == undefined && data.jobLink == undefined) {
            return res.status(400).send({
                message: "jobId/jobLink is not present",
            });
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                error: errors.array()[0].msg,
            });
        }
        
        data.company = data.company.replace(/\s+/g, ' ').trim();
        // console.log(data.company);
        data.datePosted = new Date();
        if(data.isActive) {
            data.postedBy = (await Users.find({user_id: req.user.user_id}))[0].user_id;
        }
        
        data.requested_referral = [];

        const new_job = new JobListings(data);
        await new_job.save();

        let jobid = new_job._id;
        
        if(data.isActive){
            const jobReference = jobid;
            const userJobData = {jobReference: jobReference};
            
            await Users.updateOne(
                { user_id: req.user.user_id },
                { $push: { jobs_posted: userJobData } }
            );
        }
        
        res.status(201).json({
            jobid: jobid
        });
    
    } 
    catch (err) {
        res.status(500).send({
            message: "Internal error occurred",
            error: err,
        });
    }
};


exports.postReferral = async (req, res) => {
    try {
        let data = req.body;
        // console.log(data);
        if (!data.jobReference) {
            return res.status(400).send({
                message: "Job reference is not present",
            });
        }
        
        const jobId = data.jobReference;        
  
        const job = await JobListings.findById(jobId);
        
        if (!job) {
            return res.status(400).send({
                message: "Job does not exists",
            });
        }
        
        if(job.isActive == false && job.self != true) {
            return res.send({
                message: "Job Closed"
            });
        }
        
        const userResult = await Users.find({user_id: req.user.user_id});
        if (userResult.length == 0) {
            return response.status(404).send({
                message: "User data does not exists",
            });
        }

        const userData = userResult[0];
        const job_requestedData = userData.jobs_requested;
        for(let reqjob of job_requestedData) {
            reqjob = reqjob.jobReference;
            // console.log(reqjob.id);
            if(reqjob.id === jobId) {
                return res.send({
                    message: "You have already requested for this job"
                })
            }
        }
        
        data.jobReference = jobId;
        data.candidate = userData.user_id;
        data.nosRejected = 0;
        data.isActive = true;
        data.rejectedBy = [];
        data.datePosted = new Date();
        let company = job.company;
        company= company.toLowerCase();
        // console.log(company);
        // return;
        let ind = 0;

        await Referrals.find({key: company})
        .then((docSnapshotResult) => {
            // console.log(docSnapshot.exists);
            // return ;
            if(docSnapshotResult.length > 0) {
                ind = docSnapshotResult[0].data.length;
                
                Referrals.updateOne(
                    { key: company },
                    { $push: { data: data } }
                ).exec();
            }
            else {
                // console.log("there is");
                const doc = {
                    key: company,
                    data: [data]
                }

                const new_referral = new Referrals(doc);
                new_referral.save();
            }
        })
        // const refReference = firestore.doc('referral/' + company + '/data/' + ind);
        const jobReference = jobId;
        const userJobData = {jobReference: jobReference};
        const jobRefData = {refInd: ind};
        
        await Users.updateOne(
            {user_id:req.user.user_id},
            { $push: { jobs_requested: userJobData } }
        );
        
        await JobListings.updateOne(
            {_id: jobId},
            { $push: { requested_referral: jobRefData } }
        )
      
        res.send({
            message: "Referral requested successfully",
        });
    } 
    catch (err) {
        // console.log(err);
        res.status(500).send({
            message: "Internal error occurred",
            error: err,
        });
    }
};

exports.getJobListings = async (req, res) => {
    
    try {
        const { lastJobId } = req.query;
        // console.log(lastJobId);
        let jobs;
        const pageSize = 3;
        if (!lastJobId) {
            jobs = await JobListings.find({ isActive: true }).sort({ datePosted: "desc" }).limit(pageSize + 1);
        } 
        else {
            const lastJob = await JobListings.findById(lastJobId);
            
            if (!lastJob) {
                jobs = await JobListings.find({ isActive: true }).sort({ datePosted: "desc" }).limit(pageSize + 1);
            }
            else {
                jobs = await JobListings.find({ isActive: true }).sort({ datePosted: "desc" }).skip(pageSize).limit(pageSize + 1);
            }  
        }

        // console.log(jobs);
        const hasNext = jobs.length == pageSize + 1 ? 1 : 0;
        if (jobs.length == pageSize + 1) {
            jobs.pop();
        }
        let jobListings = [];
        let lastId;
        for (let job of jobs) {
            lastId = job._id;
            let data = {
                id: job._id,
                company: job.company,
                datePosted: job.datePosted,
                desc: job.desc
            };

            const postedBy = (await Users.find({user_id: job.postedBy}))[0];

            
            
            data.postedBy = {
                id: postedBy.user_id,
                name: postedBy.name,
                infotext: postedBy.infotext
            };
            
            data.jobId = job.jobId;
            data.jobLink = job.jobLink;
            jobListings.push(data);
        }

        res.send({
            data: jobListings,
            hasNext,
            lastId
        })
        .status(200);
    } 
    catch (err) {
        // console.log(err);
        res.status(500).send({
            message: "Internal error occurred",
            error: err,
        });
    }
};

exports.getJob = async (req,res) => {
    try {
        const job = await JobListings.findById(req.params.jobid);

        if (!job) {
            return res.status(404).send({
                message: "Job data does not exists",
            });
        }
        let jobData = {
            company: job.company,
            datePosted: job.datePosted,
            isActive: job.isActive,
            jobId: job.jobId,
            jobLink: job.jobLink,
            desc: job.desc,
            postedBy: job.postedBy,
            requested_referral: job.requested_referral,
        };
        
        jobData.id = req.params.jobid;
        // userData.user_id = req.params.userId;
        // console.log("send user data");
        const postedBy = (await Users.find({user_id: job.postedBy}))[0];

        jobData.postedBy = {
            id: postedBy.user_id,
            name: postedBy.name,
            infotext: postedBy.infotext
        };
        res.send(jobData).status(200);
    } 
    catch(err) {
        res.status(500).send({
            message: "Internal error occurred",
            error: err,
        });
    }
}

exports.disableJob = async (req,res) => {
    try {
        const job = await JobListings.findById(req.params.jobid);
        if (!job) {
            return res.status(404).send({
                message: "Job data does not exists",
            });
        }
        
        const postedBy_user_id = (await Users.find({user_id: job.postedBy}))[0].user_id;
        if(postedBy_user_id != req.user.user_id) {
            return res.status(400).send("Unauthorize");
        }
        
        await JobListings.updateOne({_id: req.params.jobid},{isActive:false});
        
        res.status(200).send("Job Closed Successfully");
    } 
    catch (err) {
        // console.log(err);
        res.status(500).send({
            message: "Internal error occurred",
            error: err,
        });
    }
}

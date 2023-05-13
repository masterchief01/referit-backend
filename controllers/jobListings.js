const { validationResult } = require("express-validator");
const { getLogger } = require("../logs/logger");
const logger = getLogger();

let Users = require("../models/user.model");
let Referrals = require("../models/referral.model");
let JobListings = require("../models/jobListing.model");

exports.postNewJob = async (req, res) => {
  try {
    let data = req.body;
    if (data.jobId == undefined && data.jobLink == undefined) {
      logger.warn("jobId/jobLink is not present");
      return res.status(400).send({
        message: "jobId/jobLink is not present",
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error");
      return res.status(400).send({
        error: errors.array()[0].msg,
      });
    }

    data.company = data.company.replace(/\s+/g, " ").trim();
    logger.info(data.company);
    data.datePosted = new Date();
    if (data.isActive) {
      data.postedBy = (
        await Users.find({ user_id: req.user.user_id })
      )[0].user_id;
    }
    
    data.requested_referral = [];

    const new_job = new JobListings(data);
    await new_job.save();

    let jobid = new_job._id;

    if (data.isActive) {
      const jobReference = jobid;
      const userJobData = { jobReference: jobReference };

      await Users.updateOne(
        { user_id: req.user.user_id },
        { $push: { jobs_posted: userJobData } }
      );
    }

    logger.info("Job posted successfully");
    res.status(201).send({
      jobid: jobid,
    });
  } catch (err) {
    logger.error(err);
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
      logger.warn("Job reference is not present");
      return res.status(400).send({
        message: "Job reference is not present",
      });
    }

    const jobId = data.jobReference;

    const job = await JobListings.findById(jobId);

    if (!job) {
      logger.warn("Job does not exists");
      return res.status(400).send({
        message: "Job does not exists",
      });
    }

    if (job.isActive == false && job.self != true) {
      logger.warn("Job Closed");
      return res.send({
        message: "Job Closed",
      });
    }

    const userResult = await Users.find({ user_id: req.user.user_id });
    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return response.status(404).send({
        message: "User data does not exists",
      });
    }

    const userData = userResult[0];
    const job_requestedData = userData.jobs_requested;
    for (let reqjob of job_requestedData) {
      reqjob = reqjob.jobReference;
      logger.info(reqjob.id);
      if (reqjob.id === jobId) {
        logger.warn("You have already requested for this job");
        return res.send({
          message: "You have already requested for this job",
        });
      }
    }

    data.jobReference = jobId;
    data.candidate = userData.user_id;
    data.nosRejected = 0;
    data.isActive = true;
    data.rejectedBy = [];
    data.datePosted = new Date();
    let company = job.company;
    // console.log(company);
    // return;
    let ind = 0;

    await Referrals.find({ key: company }).then((docSnapshotResult) => {
      // console.log(docSnapshot.exists);
      // return ;
      if (docSnapshotResult.length > 0) {
        ind = docSnapshotResult[0].data.length;
        Referrals.updateOne({ key: company }, { $push: { data: data } }).exec();
      } else {
        // console.log("there is");
        const doc = {
          key: company,
          data: [data],
        };

        const new_referral = new Referrals(doc);
        new_referral.save();
      }
    });
    // const refReference = firestore.doc('referral/' + company + '/data/' + ind);
    const jobReference = jobId;
    const userJobData = { jobReference: jobReference };
    const jobRefData = { refInd: ind };

    await Users.updateOne(
      { user_id: req.user.user_id },
      { $push: { jobs_requested: userJobData } }
    );

    await JobListings.updateOne(
      { _id: jobId },
      { $push: { requested_referral: jobRefData } }
    );

    logger.info("Referral requested successfully");
    res.send({
      message: "Referral requested successfully",
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.getJobListings = async (req, res) => {
  try {
    const userResult = await Users.find({ user_id: req.user.user_id });
    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return response.status(404).send({
        message: "User data does not exists",
      });
    }

    let user = userResult[0];

    let jobs = await JobListings.find({ isActive: true }).sort({
      datePosted: "desc",
    });

    // console.log(jobs);
    let jobListings = [];
    for (let job of jobs) {
      let requested = false;
      for (let job_req of user.jobs_requested) {
        if (job._id.equals(job_req.jobReference)) {
          requested = true;
          break;
        }
      }

      let data = {
        id: job._id,
        company: job.company,
        datePosted: job.datePosted,
        desc: job.desc,
        requested: requested,
      };

      const postedBy = (await Users.find({ user_id: job.postedBy }))[0];

      data.postedBy = {
        id: postedBy.user_id,
        name: postedBy.name,
        infotext: postedBy.infotext,
      };

      data.jobId = job.jobId;
      data.jobLink = job.jobLink;
      jobListings.push(data);
    }

    logger.info("Job listings fetched successfully");
    res
      .send({
        data: jobListings,
      })
      .status(200);
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.getReferralArchive = async (req, res) => {
  try {
    const userResult = await Users.find({ user_id: req.user.user_id });
    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return response.status(404).send({
        message: "User data does not exists",
      });
    }

    let user = userResult[0];

    let jobs = await JobListings.find().sort({ datePosted: "desc" });

    // console.log(jobs);
    let referralArchive = [];
    for (let job of jobs) {
      let requested = false;
      for (let job_req of user.jobs_requested) {
        if (job._id.equals(job_req.jobReference)) {
          requested = true;
          break;
        }
      }

      let data = {
        id: job._id,
        company: job.company,
        datePosted: job.datePosted,
        desc: job.desc,
        requested: requested,
      };

      const postedBy = (await Users.find({ user_id: job.postedBy }))[0];

      if (postedBy) {
        data.postedBy = {
          id: postedBy.user_id,
          name: postedBy.name,
          infotext: postedBy.infotext,
        };
      }

      data.jobId = job.jobId;
      data.jobLink = job.jobLink;

      logger.info(data);
      referralArchive.push(data);
    }

    logger.info("Referral archive fetched successfully");
    res
      .send({
        data: referralArchive,
      })
      .status(200);
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await JobListings.findById(req.params.jobid);

    if (!job) {
      logger.warn("Job data does not exists");
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
    const postedBy = (await Users.find({ user_id: job.postedBy }))[0];

    jobData.postedBy = {
      id: postedBy.user_id,
      name: postedBy.name,
      infotext: postedBy.infotext,
    };

    logger.info("Job data fetched successfully");
    res.send(jobData).status(200);
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.disableJob = async (req, res) => {
  try {
    const job = await JobListings.findById(req.params.jobid);
    if (!job) {
      logger.warn("Job data does not exists");
      return res.status(404).send({
        message: "Job data does not exists",
      });
    }

    const postedBy_user_id = (await Users.find({ user_id: job.postedBy }))[0]
      .user_id;
    if (postedBy_user_id != req.user.user_id) {
      logger.warn("Unauthorize");
      return res.status(400).send("Unauthorize");
    }

    await JobListings.updateOne({ _id: req.params.jobid }, { isActive: false });

    logger.info("Job closed successfully");
    res.status(200).send("Job Closed Successfully");
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

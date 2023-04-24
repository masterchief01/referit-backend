const { validationResult } = require("express-validator");
const { getLogger } = require("../logs/logger");
const logger = getLogger();

let Users = require("../models/user.model");
const Referrals = require("../models/referral.model");
const JobListings = require("../models/jobListing.model");

exports.postAddUser = async (req, res) => {
  try {
    const users = await Users.find({ user_id: req.user.user_id });
    if (users.length) {
      if (users[0].isReferee != req.body.isReferee) {
        logger.warn("User already registered as other type");
        return res.status(403).send({
          message: "User already registered as other type",
        });
      } else {
        logger.info("User already registered");
        return res.send({
          message: "User Already Exists",
          isReferee: users[0].isReferee,
          signin: true,
        });
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn("Validation error");
      return res.status(400).send({
        error: errors.array()[0].msg,
      });
    }

    let data = req.body;
    data.job_posted = [];
    data.referral_feedback = [];
    data.profile_pic = req.user.pic;
    data.user_id = req.user.user_id;

    let new_user = new Users(data);
    await new_user.save();

    logger.info("User added successfully");
    res.status(201).send({
      message: "User Added Successfully",
      isReferee: data.isReferee,
      signin: false,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal Error Occured",
      error: error,
    });
  }
};

exports.getOwnUser = async (req, res) => {
  try {
    const users = await Users.find({ user_id: req.user.user_id });
    if (users.length == 0) {
      logger.warn("User data does not exists");
      return res.status(404).send({
        message: "User data does not exists",
      });
    }
    const user = users[0];
    let userData = {
      name: user["name"],
      phone_number: user["phone_number"],
      resume_link: user["resume_link"],
      email: user["email"],
      current_company: user["current_company"],
    };
    userData.user_id = req.user.user_id;

    logger.info("User data sent successfully");
    res.send(userData).status(200);
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal error occurred",
      error: error,
    });
  }
};

exports.getUserData = async (req, res) => {
  try {
    const userResult = await Users.find({ user_id: req.params.userId });

    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return res.status(404).send({
        message: "User data does not exists",
      });
    }
    const user = userResult[0];

    let userGenData = {
      institute: user.institute,
      cgpa: user.cgpa,
      current_company: user.current_company,
      work_experience: user.work_experience,
      resume_link: user.resume_link,
      job_role: user.job_role,
      branch: user.branch,
      phone_number: user.phone_number,
      codeforces: user.codeforces,
      isReferee: user.isReferee,
      infotext: user.infotext,
      codechef: user.codechef,
      graduating_year: user.graduating_year,
      name: user.name,
      email: user.email,
      github: user.github,
      leetcode: user.leetcode,
      linkedin: user.linkedin,
      profile_pic: user.profile_pic,
    };
    const userData = {
      general: userGenData,
    };
    userData.user_id = req.params.userId;

    logger.info("User data sent successfully");
    res.send(userData).status(200);
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.getUserSecData = async (req, res) => {
  try {
    const userResult = await Users.find({ user_id: req.params.userId });

    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return res.status(404).send({
        message: "User data does not exists",
      });
    }

    const user = userResult[0];

    let jobPosted = [];
    let referralFeedback = [];
    const job_posted = user.jobs_posted;
    for (let i = job_posted.length - 1; i >= 0; i--) {
      let data = {
        id: job_posted[i].jobReference,
      };

      let valid = true;
      // console.log(data);
      await JobListings.findById(job_posted[i].jobReference).then((snap) => {
        if (snap) {
          const job = snap;
          data.company = job.company;
          data.jobId = job.jobId;
          data.isActive = job.isActive;
        } else {
          valid = false;
        }
      });

      // console.log(data);
      if (valid) {
        jobPosted.push(data);
      }

      if (jobPosted.length >= 20) {
        break;
      }
    }

    const referral_feedback = user.referrals_feedback;
    // console.log(referral_feedback);
    for (let i = referral_feedback.length - 1; i >= 0; i--) {
      let job = {};
      let givenBy = {};
      let valid = true;

      await JobListings.findById(referral_feedback[i].jobRef).then((snap) => {
        // const j = snap.data();
        if (snap) {
          job.company = snap.company;
          job.jobId = snap.jobId;
        } else {
          valid = false;
        }
      });

      await Users.find({ user_id: referral_feedback[i].givenBy }).then(
        (snaps) => {
          // const g = snap.data();

          if (snaps.length) {
            givenBy.name = snaps[0].name;
          } else {
            valid = false;
          }
        }
      );

      // console.log(job);
      if (!valid) {
        continue;
      }

      const data = {
        type: referral_feedback[i].type,
        msg: referral_feedback[i].msg,
        company: job.company,
        jobId: job.jobId,
        id: referral_feedback[i].jobRef,
        givenBy: givenBy.name,
        givenById: referral_feedback[i].givenBy,
      };
      referralFeedback.push(data);
      if (referralFeedback.length >= 10) {
        break;
      }
    }

    logger.info("User data sent successfully");
    res.send({
      jobPosted: jobPosted,
      referralFeedback: referralFeedback,
    });
  } catch (err) {
    logger.error(err);
    res.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.editUserData = async (req, res) => {
  try {
    const users = await Users.find({ user_id: req.user.user_id });

    if (users.length == 0) {
      logger.warn("User data does not exists");
      return res.status(404).send({
        message: "User data does not exists",
      });
    }

    logger.info(user.data.email);
    req.body.email = req.user.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(errors.array()[0].msg);
      return res.status(400).send({
        error: errors.array()[0].msg,
      });
    }
    let data = req.body;
    logger.info(data);
    await Users.findOneAndUpdate({ user_id: req.user.user_id }, data);

    logger.info("User data edited successfully");
    res.status(201).send({
      message: "User data edited successfully",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal error occurred",
      error: error,
    });
  }
};

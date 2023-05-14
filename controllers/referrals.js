const { validationResult } = require("express-validator");
const { getLogger } = require("../logs/logger");
const logger = getLogger();

const Users = require("../models/user.model");
const Referrals = require("../models/referral.model");
const JobListings = require("../models/jobListing.model");

exports.getReferralByCompany = async (req, response) => {
  try {
    // console.log(req);
    const users = await Users.find({ user_id: req.user.user_id });

    if (users.length == 0) {
      logger.warn("User data does not exists");
      return response.status(404).send({
        message: "User data does not exists",
      });
    }

    const user = users[0];

    let company;
    logger.info(user.isReferee);
    if (!user.isReferee) {
      logger.info(user);
      company = user.current_company;
    } else {
      logger.warn("You can't see Referral");
      return response.status(403).send({
        message: "You can't see Referral",
      });
    }

    let allReferralsResult = await Referrals.find({ key: company });
    if (allReferralsResult.length == 0) {
      logger.info("No Referral for this company");
      return response.status(202).send({
        data: [],
      });
    }

    let allReferrals = allReferralsResult[0];

    const referral = allReferrals.data;

    let needReferral = [];

    for (let i = referral.length - 1; i >= 0; i--) {
      if (referral[i].isActive) {
        let alreadyRejected = false;
        for (let rejectedByRef of referral[i].rejectedBy) {
          const rejectedByRef_user_id = (
            await Users.find({ user_id: rejectedByRef.id })
          )[0].user_id;
          if (rejectedByRef_user_id == req.user.user_id) {
            // console.log("good");
            alreadyRejected = true;
            break;
          }
        }

        if (alreadyRejected) continue;

        const candidate = (
          await Users.find({ user_id: referral[i].candidate })
        )[0];
        const job = await JobListings.findById(referral[i].jobReference);
        // console.log(candidate);
        // console.log(job);
        data = {
          company: job.company,
          jobId: job.jobId,
          jobLink: job.jobLink,
          canName: candidate.name,
          canEmail: candidate.email,
          canPhone: candidate.phone_number,
          canId: candidate.user_id,
          canResume: candidate.resume_link,
          id: i,
        };
        // console.log(data);
        needReferral.push(data);
      }
    }

    logger.info(needReferral);
    response.send({
      data: needReferral,
    });
  } catch (err) {
    logger.error(err);
    response.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.getReferralByJob = async (req, response) => {
  try {
    const { jobId } = req.query;
    // console.log(jobId);

    if (!jobId) {
      return response.status(400).send("No Job Id given");
    }

    const job = await JobListings.findById(jobId);
    // console.log(job);
    if (!job) {
      return response.status(400).send("No Job present with this Id");
    }

    const userResult = await Users.find({ user_id: req.user.user_id });
    if (userResult.length == 0) {
      logger.warn("User data does not exists");
      return response.status(404).send({
        message: "User data does not exists",
      });
    }

    const user = userResult[0];

    if (user.current_company != job.company) {
      logger.warn("You can't see referral for this job");
      return response.status(403).send({
        message: "You can't see referral for this job",
      });
    }

    const refReqArr = job.requested_referral;
    // console.log(refReqArr);

    let needReferral = [];

    let company = job.company;
    let allReferralsResult = await Referrals.find({ key: company });
    if (allReferralsResult.length == 0) {
      return response.status(202).send({
        data: [],
      });
    }

    let allReferrals = allReferralsResult[0].data;
    // console.log(allReferrals);
    for (let i = refReqArr.length - 1; i >= 0; i--) {
      const nowInd = refReqArr[i].refInd;
      // console.log(nowInd);
      if (allReferrals[nowInd].isActive) {
        let alreadyRejected = false;
        for (let rejectedByRef of allReferrals[nowInd].rejectedBy) {
          const rejectedByRef_user_id = (
            await Users.find({ user_id: rejectedByRef.id })
          )[0].user_id;
          if (rejectedByRef_user_id == req.user.user_id) {
            alreadyRejected = true;
            break;
          }
        }

        if (alreadyRejected) continue;

        const candidate = (
          await Users.find({ user_id: allReferrals[nowInd].candidate })
        )[0];
        const job = await JobListings.findById(
          allReferrals[nowInd].jobReference
        );
        // console.log(candidate);
        // console.log(job);
        data = {
          company: job.company,
          jobId: job.jobId,
          jobLink: job.jobLink,
          canName: candidate.name,
          canEmail: candidate.email,
          canPhone: candidate.phone_number,
          canId: candidate.user_id,
          canResume: candidate.resume_link,
          id: nowInd,
        };
        // console.log(data);
        needReferral.push(data);
        // console.log("there");
      }
    }

    logger.info(needReferral);
    response.status(200).send({
      data: needReferral,
    });
  } catch (err) {
    logger.error(err);
    response.status(500).send({
      message: "Internal error occurred",
      error: err,
    });
  }
};

exports.giveFeedback = async (req, res) => {
  try {
    let { company } = req.query;
    const { ind } = req.query;
    const feedbackData = req.body.feedback;
    // console.log(company);
    // console.log(ind);
    // console.log(feedbackData.feedback);
    let UserIsReferee;
    await Users.find({ user_id: req.user.user_id }).then((docSnapResult) => {
      UserIsReferee = docSnapResult[0].isReferee;
    });
    // console.log(UserIsReferee);
    if (UserIsReferee) {
      return res.send({
        message: "You can't give feedback",
      });
    }
    if (company==undefined || ind==undefined || feedbackData==undefined) {
      return res.status(400).send("Insufficient data");
    }

    let referralResult = await Referrals.find({ key: company });

    if (!referralResult.length) {
      return res.send({
        message: "No Referral exists",
      });
    }

    let referral = referralResult[0];
    referral = referral.data[ind];
    if (!referral.isActive) {
      return res.send({
        message: "Referral does not exist",
      });
    }
    // console.log(referral.jobReference);
    // console.log(referral.candidate);
    let data = {
      type: "feedback",
      jobRef: referral.jobReference,
      givenBy: (await Users.find({ user_id: req.user.user_id }))[0].user_id,
      msg: feedbackData,
    };

    logger.info(data);
    await Users.updateOne(
      { user_id: referral.candidate },
      { $push: { referrals_feedback: data } }
    ).then(
      res.send({
        message: "Feedback given",
      })
    );
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal error occurred",
      error: error,
    });
  }
};

exports.giveReferral = async (req, res) => {
  try {
    let { company } = req.query;
    const { ind } = req.query;
    // console.log(company);
    // console.log(ind);

    let UserIsReferee;
    await Users.find({ user_id: req.user.user_id }).then((docSnapResult) => {
      UserIsReferee = docSnapResult[0].isReferee;
    });


    // console.log(UserIsReferee);
    if (UserIsReferee) {
      return res.send({
        message: "You can't refer",
      });
    }

    if (company==undefined || ind==undefined) {
      return res.status(400).send("Insufficient data");
    }

    let referralResult = await Referrals.find({ key: company });

    if (referralResult.length == 0) {
      logger.info("No Referral exists");
      return res.send({
        message: "No Referral exists",
      });
    }

    let allReferral = referralResult[0].data;
    const referral = allReferral[ind];


    if (!referral.isActive) {
      logger.info("Referral does not exist");
      return res.status(200).send({
        message: "Referral does not exist",
      });
    }
    // console.log(referral.jobReference);
    // console.log(referral.candidate);
    let feedbackData = {
      type: "refer",
      jobRef: referral.jobReference,
      givenBy: (await Users.find({ user_id: req.user.user_id }))[0].user_id,
    };

    await Users.updateOne(
      { user_id: referral.candidate },
      { $push: { referrals_feedback: feedbackData } }
    );

    let remData = [];
    for (let i = 0; i < allReferral.length; i++) {
      if (i != ind) {
        remData.push(allReferral[i]);
      } else {
        let dd = allReferral[i];
        dd.isActive = false;
        remData.push(dd);
      }
    }

    await Referrals.updateOne({ key: company }, { data: remData });

    logger.info(feedbackData);
    res.send({
      message: "Referred",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal error occurred",
      error: error,
    });
  }
};

exports.rejectReferral = async (req, res) => {
  try {
    let { company } = req.query;
    const { ind } = req.query;
    logger.info(company);
    logger.info(ind);

    let UserIsReferee;
    await Users.find({ user_id: req.user.user_id }).then((docSnapResult) => {
      UserIsReferee = docSnapResult[0].isReferee;
    });

    logger.info(UserIsReferee);
    if (UserIsReferee) {
      logger.info("You can't reject");
      return res.send({
        message: "You can't reject",
      });
    }
    if (company==undefined || !ind==undefined) {
      logger.info("Insufficient data");
      return res.status(400).send("Insufficient data");
    }

    let referralResult = await Referrals.find({ key: company });

    if (!referralResult.length) {
      logger.info("No Referral exists");
      return res.send({
        message: "No Referral exists",
      });
    }

    let allReferral = referralResult[0].data;
    const referral = allReferral[ind];

    for (let rejectedByRef of referral.rejectedBy) {
      const rejectedByRef_user_id = (
        await Users.find({ user_id: rejectedByRef.id })
      )[0].user_id;
      if (rejectedByRef_user_id == req.user.user_id) {
        logger.info("Already been Rejected");
        return res.send({
          message: "Already been Rejected",
        });
      }
    }
    if (!referral.isActive) {
      logger.info("Referral does not exist");
      return res.status(200).send({
        message: "Referral does not exist",
      });
    }
    // console.log(referral.jobReference);
    // console.log(referral.candidate);
    let feedbackData = {
      type: "reject",
      jobRef: referral.jobReference,
      givenBy: (await Users.find({ user_id: req.user.user_id }))[0].user_id,
    };

    await Users.updateOne(
      { user_id: referral.candidate },
      { $push: { referrals_feedback: feedbackData } }
    );

    let remData = [];
    for (let i = 0; i < allReferral.length; i++) {
      if (i != ind) {
        remData.push(allReferral[i]);
      } else {
        let dd = allReferral[i];
        if (dd.nosRejected === 4) {
          dd.isActive = false;
        } else {
          dd.nosRejected = dd.nosRejected + 1;
          const by = {
            id: req.user.user_id,
          };
          dd.rejectedBy.push(by);
        }
        remData.push(dd);
      }
    }

    await Referrals.updateOne({ key: company }, { data: remData });

    // console.log(feedbackData);
    logger.info(feedbackData);
    res.send({
      message: "Rejected",
    });
  } catch (error) {
    logger.error(error);
    res.status(500).send({
      message: "Internal error occurred",
      error: error,
    });
  }
};

const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
  postNewJob,
  postReferral,
  getJobListings,
  getJob,
  disableJob,
  getReferralArchive,
} = require("../controllers/jobListings");
const isAuth = require("../middleware/is-auth");

// /**
//  * @swagger
//  * /api/jobListings/addjob:
//  *   post:
//  *     summary: add job posting.
//  *     description: add job posting.
//  *     parameters:
//  *       - in: body
//  *         name: jobData
//  *         required: true
//  *     responses:
//  *       201:
//  *         description: job added.
//  *       400:
//  *         description: field validation errors.
//  */
router.post(
  "/addjob",
  isAuth,
  check("company", "company name is not present").not().isEmpty(),
  postNewJob
);

// /**
//  * @swagger
//  * /api/jobListings/getJobListings:
//  *   get:
//  *     summary: get job listings.
//  *     description: get job listings.
//  *     responses:
//  *       200:
//  *         description: referrals found.
//  *       400:
//  *         description: no referrrals found.
//  */
router.get("/", isAuth, getJobListings);

// /**
//  * @swagger
//  * /api/jobListings/job/referralArchive:
//  *   get:
//  *     summary: get referral by jobId.
//  *     description: get referral by jobId.
//  *     parameters:
//  *       - in: query
//  *         name: jobId
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: referrals found.
//  *       400:
//  *         description: no referrrals found.
//  *       403:
//  *         description: user cannot get referral.
//  */
router.get("/referralArchive", isAuth, getReferralArchive);
// /**
//  * @swagger
//  * /api/jobListings/job/:jobId:
//  *   get:
//  *     summary: get referral by jobId.
//  *     description: get referral by jobId.
//  *     parameters:
//  *       - in: query
//  *         name: jobId
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: referrals found.
//  *       400:
//  *         description: no referrrals found.
//  *       403:
//  *         description: user cannot get referral.
//  */
router.get("/:jobid", getJob);
// /**
//  * @swagger
//  * /api/jobListings/:jobId:
//  *   get:
//  *     summary: get referral by jobId.
//  *     description: get referral by jobId.
//  *     parameters:
//  *       - in: query
//  *         name: jobId
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: referrals found.
//  *       400:
//  *         description: no referrrals found.
//  *       403:
//  *         description: user cannot get referral.
//  */
router.patch("/:jobid", isAuth, disableJob);
// /**
//  * @swagger
//  * /api/jobListings/job/requestReferral:
//  *   get:
//  *     summary: get referral by jobId.
//  *     description: get referral by jobId.
//  *     parameters:
//  *       - in: query
//  *         name: jobId
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: referrals found.
//  *       400:
//  *         description: no referrrals found.
//  *       403:
//  *         description: user cannot get referral.
//  */
router.post("/requestReferral", isAuth, postReferral);

module.exports = router;

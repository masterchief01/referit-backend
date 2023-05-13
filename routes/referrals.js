const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

const {
  getReferralByCompany,
  getReferralByJob,
  giveFeedback,
  giveReferral,
  rejectReferral,
} = require("../controllers/referrals");

router.get("/", (request, response) => {
  response.send("welcome to referrals");
});

// /**
//  * @swagger
//  * /api/referral/company:
//  *   get:
//  *     summary: Add a valid User.
//  *     description: Add a user to the database.
//  *     responses:
//  *       202:
//  *         description: no valid referrals for this company.
//  *       404:
//  *         description: user not found.
//  *       403:
//  *         description: referral not visible.
//  */
router.get("/company", isAuth, getReferralByCompany);

// /**
//  * @swagger
//  * /api/referral/job:
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
router.get("/job", isAuth, getReferralByJob);

// /**
//  * @swagger
//  * /api/referral/feedbackreferral:
//  *   patch:
//  *     summary: give feedback on referral.
//  *     description: give feedback on referral.
//  *     parameters:
//  *       - in: query
//  *         name: company
//  *         required: true
//  *       - in: body
//  *         name: feedbackdata
//  *         required: true
//  *     responses:
//  *       202:
//  *         description: feedback data updated.
//  *       400:
//  *         description: error in fetching corresponding referral.
//  */
router.patch("/feedbackreferral", isAuth, giveFeedback);

// /**
//  * @swagger
//  * /api/referral/referreferral:
//  *   patch:
//  *     summary: Give referral to user.
//  *     description: Give referral to user.
//  *     parameters:
//  *       - in: query
//  *         name: company
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: referral applied to user.
//  *       400:
//  *         description: problem in parsing company.
//  */
router.patch("/referreferral", isAuth, giveReferral);

// /**
//  * @swagger
//  * /api/referral/rejectreferral:
//  *   patch:
//  *     summary: reject a referral request.
//  *     description: reject a referral request.
//  *     parameters:
//  *       - in: query
//  *         name: company
//  *         required: true
//  *     responses:
//  *       200:
//  *         description: request processed.
//  *       400:
//  *         description: problem in parsing company.
//  */
router.patch("/rejectreferral", isAuth, rejectReferral);

module.exports = router;

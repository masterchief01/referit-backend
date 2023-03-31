const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is-auth");


const {
    getReferralByCompany,
    getReferralByJob,
    giveFeedback,
    giveReferral,
    rejectReferral
} = require("../controllers/referrals");

router.get('/',(request,response) => {
    response.send(
        "welcome to referrals"
    )
});


router.get('/company',isAuth,getReferralByCompany);
router.get('/job',isAuth,getReferralByJob);
router.patch('/feedbackreferral',isAuth,giveFeedback);
router.patch('/referreferral',isAuth,giveReferral);
router.patch('/rejectreferral',isAuth,rejectReferral);

module.exports = router;
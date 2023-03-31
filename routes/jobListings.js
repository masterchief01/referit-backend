const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const {
    postNewJob,
    postReferral,
    getJobListings,
    getJob,
    disableJob
} = require("../controllers/jobListings");
const isAuth = require("../middleware/is-auth");



router.post(
    "/addjob",
    isAuth,
    check("company", "company name is not present").not().isEmpty(),
    postNewJob
);

router.get("/", getJobListings);
router.get("/:jobid",getJob);

router.patch("/:jobid",isAuth,disableJob);

router.post("/requestReferral", isAuth, postReferral);

module.exports = router;
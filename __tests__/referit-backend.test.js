require("dotenv").config();
const mongoose = require("mongoose");
const {postAddUser, getOwnUser, getUserData, getUserSecData, editUserData} = require("../controllers/users");
const {postNewJob, postReferral, getJobListings, getReferralArchive, getJob, disableJob} = require("../controllers/jobListings");
const { giveReferral, rejectReferral, giveFeedback } = require("../controllers/referrals");

let uri = process.env.MONGO_TEST_URI;
mongoose.connect(uri);
mongoose.connection.collections['users'].drop( function(err) {
    console.log('collection dropped');
});

mongoose.connection.collections['referrals'].drop( function(err) {
    console.log('collection dropped');
});

mongoose.connection.collections['joblistings'].drop( function(err) {
    console.log('collection dropped');
});



const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB Test database connection established successfully");
});

describe("User Tests", () => {

  it("Add User (Student) [SignUp]/postAddUser", async () => {
    const req = {
      user: {
        "user_id": "test-student-user-id",
        "pic": "random"
      },
      body: {
        "name": "Test Student",
        "email": "test-student-email@gmail.com",
        "isReferee": true
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postAddUser(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: "User Added Successfully",
      isReferee: true,
      signin: false,
    });
  }, 100000);

  it("Add User (Professional) [SignUp]/postAddUser", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
        "pic": "random"
      },
      body: {
        "name": "Test Professional",
        "email": "test-professional-email@gmail.com",
        "isReferee": false
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postAddUser(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: "User Added Successfully",
      isReferee: false,
      signin: false,
    });
  }, 100000);

  it("Add User (Professional) with existing student email address /postAddUser", async () => {
    const req = {
      user: {
        "user_id": "test-student-user-id",
        "pic": "random"
      },
      body: {
        "name": "Test Student",
        "email": "test-student-email@gmail.com",
        "isReferee": false
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postAddUser(req, res);
    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({
      message: "User already registered as other type",
    });
  }, 100000);


  it("Add User (Professional) with existing email address [SignIn] /postAddUser", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
        "pic": "random"
      },
      body: {
        "name": "Test Professional",
        "email": "test-professional-email@gmail.com",
        "isReferee": false
      },
    };

    const res = {
      body: {},
      send: function (input) {
        this.body = input;
      }
    };

    await postAddUser(req, res);
    expect(res.body).toEqual({
        message: "User Already Exists",
        isReferee: false,
        signin: true
    });
  }, 100000);


  it("Edit User (Professional) /editUserData", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
        "pic": "random"
      },
      body: {
        "name": "Test Professional",
        "email": "test-professional-email@gmail.com",
        "isReferee": false,
        "current_company": "microsoft",
        "infotext": "Random Info",
        "linkedin": "http://www.xyz.com",
        "github": "http://www.xyz.com",
        "leetcode": "http://www.xyz.com",
        "work_experience": 2,
        "job_role": "SWE",
        "phone_number": "9999999999"
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await editUserData(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      message: "User data edited successfully",
    });
  }, 100000);

  it("Get Own User (Professional) /getOwnUser", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      }
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await getOwnUser(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      name: "Test Professional",
      phone_number: "9999999999",
      resume_link: undefined,
      email: "test-professional-email@gmail.com",
      current_company: "microsoft",
      user_id: "test-professional-user-id"
    });
  }, 100000);

  it("Get Own User (Professional) /getUserData", async () => {
    const req = {
      params: {
        "userId": "test-professional-user-id",
      }
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await getUserData(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      general: {
        institute: undefined,
        cgpa: undefined,
        current_company: "microsoft",
        work_experience: 2,
        resume_link: undefined,
        job_role: "SWE",
        branch: undefined,
        phone_number: "9999999999",
        codeforces: undefined,
        isReferee: false,
        infotext: "Random Info",
        codechef: undefined,
        graduating_year: undefined,
        name: "Test Professional",
        email: "test-professional-email@gmail.com",
        github: "http://www.xyz.com",
        leetcode: "http://www.xyz.com",
        linkedin: "http://www.xyz.com",
        profile_pic: "random",
      },
      user_id: "test-professional-user-id"
    });
  }, 100000);
});

describe("Job Listings Tests", () => {

  it("Add New Job (Professional) /postNewJob", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      },
      body: {
        "jobId": "123456",
        "jobLink": undefined,
        "company": "microsoft",
        "isActive": true,


      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postNewJob(req, res);
    expect(res.statusCode).toBe(201);
  }, 100000);

  

  it("Post Referral 1 (Student) /postReferral", async () => {
    const req1 = {
      user: {
        "user_id": "test-student-user-id",
      },
      body: {
        "jobId": "1",
        "jobLink": undefined,
        "company": "microsoft",
        "isActive": false,
        "self": true
      },
    };

    const res1 = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postNewJob(req1, res1);
    expect(res1.statusCode).toBe(201);
    let jobReference = res1.body.jobid;

    const req2 = {
      user: {
        "user_id": "test-student-user-id",
      },
      body: {
        "jobReference": jobReference,
      },
    };

    const res2 = {
      body: {},
      send: function (input) {
        this.body = input;
      }
    };

    await postReferral(req2,res2);
    expect(res2.body).toEqual({
      message: "Referral requested successfully"
    });
  }, 100000);

  it("Post Referral 2 (Student) /postReferral", async () => {
    const req1 = {
      user: {
        "user_id": "test-student-user-id",
      },
      body: {
        "jobId": "2",
        "jobLink": undefined,
        "company": "microsoft",
        "isActive": false,
        "self": true
      },
    };

    const res1 = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postNewJob(req1, res1);
    expect(res1.statusCode).toBe(201);
    let jobReference = res1.body.jobid;

    const req2 = {
      user: {
        "user_id": "test-student-user-id",
      },
      body: {
        "jobReference": jobReference,
      },
    };

    const res2 = {
      body: {},
      send: function (input) {
        this.body = input;
      }
    };

    await postReferral(req2,res2);
    expect(res2.body).toEqual({
      message: "Referral requested successfully"
    });
  }, 100000);

  it("Get Job Listings (Professional) /getJobListings", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await getJobListings(req, res);
    expect(res.statusCode).toBe(200);
  }, 100000);


  it("Fetch Requested Referrals (Student) /getReferralArchive", async () => {
    const req = {
      user: {
        "user_id": "test-student-user-id",
      },
    };

    const res = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await getReferralArchive(req, res);
    expect(res.statusCode).toBe(200);
  }, 100000);

  it("Disable Job (Professional) /disableJob", async () => {
    const req1 = {
      user: {
        "user_id": "test-professional-user-id",
      },
      body: {
        "jobId": "123456",
        "jobLink": undefined,
        "company": "microsoft",
        "isActive": true,


      },
    };

    const res1 = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await postNewJob(req1, res1);
    expect(res1.statusCode).toBe(201);
    let jobid = res1.body.jobid;

    const req2 = {
      user: {
        "user_id": "test-professional-user-id",
      },
      params: {
        jobid: jobid
      }
    }

    const res2 = {
      statusCode: 0,
      body: {},
      send: function (input) {
        this.body = input;
      },
      status: function (code) {
        this.statusCode = code;
        return this;
      },
    };

    await disableJob(req2, res2);
    expect(res2.statusCode).toBe(200);
    expect(res2.body).toEqual("Job Closed Successfully");


  }, 100000);

});

describe("Referrals Tests", () => {

  it("Give Feedback (Professional) /giveFeedback", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      },
      query: {
        company: "microsoft",
        ind: 0,
      },
      body: {
        feedback: "Good."
      }
    };

    const res = {
      body: {},
      send: function (input) {
        this.body = input;
      },
    };

    await giveFeedback(req, res);
    expect(res.body).toEqual({
      message: "Feedback given",
    });
  }, 100000);
  
  it("Accept Referral (Professional) /giveReferral", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      },
      query: {
        company: "microsoft",
        ind: 0,
      },
    };

    const res = {
      body: {},
      send: function (input) {
        this.body = input;
      },
    };

    await giveReferral(req, res);
    expect(res.body).toEqual({
      message: "Referred",
    });
  }, 100000);


  it("Reject Referral (Professional) /rejectReferral", async () => {
    const req = {
      user: {
        "user_id": "test-professional-user-id",
      },
      query: {
        company: "microsoft",
        ind: 1,
      },
    };

    const res = {
      body: {},
      send: function (input) {
        this.body = input;
      },
    };

    await rejectReferral(req, res);
    expect(res.body).toEqual({
      message: "Rejected",
    });
  }, 100000);
});
  





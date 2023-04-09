const firebase = require("firebase-admin");
const config = require("./config");
/////***********This file is compulsory to add..... Should be downloaded from firebase and renamed as firebaseAdminSdk.json*********************/////////////
var credentials = require("./credentials.json");

firebase.initializeApp({
  ...config.firebaseConfig,
  credential: firebase.credential.cert(credentials),
});

module.exports = firebase;

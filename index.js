try{
  require("dotenv").config();
  const express = require("express");
  const app = express();
  const cors = require("cors");
  const morgan = require("morgan");
  const mongoose = require("mongoose");
  const responseTime = require("response-time");
  const swaggerUi = require("swagger-ui-express");
  const swaggerSpec = require("./swagger");

  const { logError } = require("./logs/errorLogger");
  const { logResponseTime } = require("./logs/responseTimeLogger");

  require("dotenv").config();
  const port = process.env.PORT || 5001;

  const { getLogger } = require("./logs/logger");
  const logger = getLogger();
  logger.info("Starting app in env: " + process.env.NODE_ENV);

  //-----MIDDLEWARE-----
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(responseTime(logResponseTime));
  app.use(logError);

  // get driver connection
  let uri = "";
  if (process.env.NODE_ENV === "testing") {
    uri = process.env.MONGO_TEST_URI;
  } else {
    uri = process.env.MONGO_URI;
  }
  mongoose.connect(uri);
  const connection = mongoose.connection;
  connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
  });

  // Declerative Endpoints
  app.get("/health", (req, res) => {
    res.send("Health check");
  });

  app.post("/test", require("./controllers/sample").sumRequest);

  app.get("/error", (req, res) => {
    throw new Error("Error thrown");
  });

  // Router Decleration
  const userRoutes = require("./routes/users");
  const referralRoutes = require("./routes/referrals");
  const jobListingRoutes = require("./routes/jobListings");

  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use(
    "/api",
    express.Router().get("/", (req, res) => {
      res.send("welcome to refer it backend");
    })
  );

  app.use("/api/users", userRoutes);
  app.use("/api/referral", referralRoutes);
  app.use("/api/jobListings", jobListingRoutes);

  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}
catch(error) {
  logger.info(error)
}
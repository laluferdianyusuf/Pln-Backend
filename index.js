const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const upload = require("./utils/fileUpload");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const app = express();
dotenv.config();

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// controller
const userController = require("./controllers/userController");
const reportController = require("./controllers/reportController");

// middleware
const middleware = require("./middlewares/auth");

// end point
// user
app.post(
  "/v1/api/users/register",
  middleware.authenticate,
  middleware.isSuperAdmin,
  userController.register
);
app.post(
  "/v1/api/users/register/supervisor",
  middleware.authenticate,
  middleware.isSuperAdmin,
  userController.registerSupervisor
);
app.post("/v1/api/users/login", userController.login);
app.get("/v1/api/users", userController.getAllUsers);
app.get(
  "/v1/api/users/me",
  middleware.authenticate,
  userController.currentUser
);
app.get("/v1/api/users/:division", userController.getUserDivision);
app.get("/v1/api/users/by/:id", userController.getUserById);
app.get("/v1/api/users/recap/:division", userController.getRecapUserDivision);
app.put(
  "/v1/api/update/:id",
  middleware.authenticate,
  middleware.isSuperAdmin,
  userController.updateUserBySupervisor
);
app.delete("/v1/api/users/delete/:id", userController.deleteUserById);
app.get("/v1/api/find/:reportType", userController.getUserByReportType);
app.get(
  "/v1/api/created/:reportCreatedAt/division/:division",
  userController.getUsersByReportCreatedAt
);
app.get(
  "/v1/api/day/:day/division/:division",
  userController.getUsersByReportByDay
);

// report
app.post(
  "/v2/api/create-report",
  middleware.authenticate,
  middleware.isEmployee,
  upload.single("image"),
  reportController.createReport
);
app.get("/v2/api/reports/:division", reportController.getReportByUserDivision);

app.get("/v2/api/search/:createdById", reportController.getReportByCreatedById);
app.get(
  "/v2/api/reports/by/:createdAt",
  reportController.getReportsByCreatedAt
);
app.get("/v2/api/reports", reportController.getAllReports);

app.get("/v1/api/keep-warm", (req, res) => {
  console.log("Keep warm request received at:", new Date());
  res.status(200).send("Keeping warm!");
});

const cronJob = require("./controllers/cronJobController");

// Endpoint untuk menjalankan tugas harian
app.get("/api/schedule/daily", cronJob.dailyCron);

// Endpoint untuk menjalankan tugas mingguan
app.get("/api/schedule/weekly", cronJob.weeklyCron);

// Endpoint untuk menjalankan tugas bulanan
app.get("/api/schedule/monthly", cronJob.monthlyCron);

// Endpoint untuk menjalankan tugas setiap menit (opsional)
app.get("/api/schedule/minutes", async (req, res) => {
  await dailyCron(); // Ganti dengan fungsi sesuai kebutuhan
  res.status(200).send("Cron executed every minute");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

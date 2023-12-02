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

app.get("/v1/api/keep-warm", (req, res) => {
  console.log("Keep warm request received at:", new Date());
  res.status(200).send("Keeping warm!");
});

// schedule cron
const schedule = require("node-schedule");
const { dailyCron, weeklyCron, monthlyCron } = require("./schedule/dailyCron");

function scheduleMinutes() {
  schedule.scheduleJob("* * * * *", function () {
    console.log("Running every minute");
    dailyCron();
  });
}

function scheduleDailyCron() {
  schedule.scheduleJob("59 23 * * *", function () {
    console.log("Running dailyCron at:", new Date());
    dailyCron();
  });
}

// Fungsi untuk menjalankan cron mingguan pada jam 23:59 setiap hari Minggu
function scheduleWeeklyCron() {
  schedule.scheduleJob("59 23 * * 0", function () {
    console.log("Running weeklyCron at:", new Date());
    weeklyCron();
  });
}

// Fungsi untuk menjalankan cron bulanan pada jam 23:59 setiap tanggal 1 bulan
function scheduleMonthlyCron() {
  schedule.scheduleJob("59 23 1 * *", function () {
    console.log("Running monthlyCron at:", new Date());
    monthlyCron();
  });
}

// Menjalankan fungsi untuk pertama kali
scheduleMinutes();
scheduleDailyCron();
scheduleWeeklyCron();
scheduleMonthlyCron();

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

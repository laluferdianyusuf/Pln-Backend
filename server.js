const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const upload = require("./utils/fileUpload");
const userRepository = require("./repositories/userRepository");
const reportRepository = require("./repositories/reportRepository");

const app = express();
dotenv.config();

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// node cron
const cron = require("node-cron");

cron.schedule("0 0 * * *", async () => {
  console.log("apakah");
  try {
    const users = await userRepository.getUsers();
    const reports = await reportRepository.getReportByType("HARIAN");

    for (const user of users) {
      console.log("updated");
      await userRepository.updateUserStatus(user.id, "alpha");
    }

    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "MINGGUAN");
    }
    console.log("berhasil updated");
  } catch (error) {
    throw error;
  }
});

cron.schedule("0 0 */7 * *", async () => {
  try {
    const reports = await reportRepository.getReportByType("MINGGUAN");

    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "BULANAN");
    }
  } catch (error) {
    throw error;
  }
});

cron.schedule("0 0 1 * *", async () => {
  try {
    const user = await userRepository.getUsersByReportType("BULANAN");

    for (const users of user) {
      await userRepository.deleteUsers();
      await reportRepository.deleteReport("BULANAN");
    }

    const uploadDirectory = "public/uploads";

    // Get the current time
    const currentTime = new Date();

    // Read the contents of the upload directory
    fs.readdir(uploadDirectory, (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(uploadDirectory, file);
        const fileStat = fs.statSync(filePath);

        const fileAgeInMilliseconds = currentTime - fileStat.mtime;

        const oneMonthInMilliseconds = 30 * 24 * 60 * 60 * 1000;

        if (fileAgeInMilliseconds > oneMonthInMilliseconds) {
          fs.unlinkSync(filePath);
          console.log(`Deleted: ${filePath}`);
        }
      });
    });
  } catch (error) {
    throw error;
  }
});

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

app.listen(process.env.PORT, () => {
  console.log(`Server is running at http://localhost:${process.env.PORT}`);
});

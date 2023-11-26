const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const upload = require("./utils/fileUpload");
const userRepository = require("./repositories/userRepository");
const reportRepository = require("./repositories/reportRepository");
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

// node cron
const cron = require("node-cron");

cron.schedule("59 23 * * *", async () => {
  console.log("daily schedule");
  try {
    const users = await userRepository.getUsers();
    const reports = await reportRepository.getReportByType("HARIAN");
    const nowDays = dayjs().tz("Asia/Makassar");

    const createdAt = nowDays.format("dddd D MMMM YYYY HH:mm");

    for (const user of users) {
      const saveToDB = await userRepository.saveToNewDb({
        id: user.id,
        name: user.name,
        nip: user.nip,
        division: user.division,
        email: user.email,
        password: user.password,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        status: user.status,
        days: createdAt,
        recapType: "MINGGUAN",
        userId: user.id,
      });
      if (saveToDB) {
        await userRepository.updateUserStatus(user.id, "alpha");
        console.log("updated");
      } else {
        console.log("no data to save");
      }
    }

    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "MINGGUAN");
    }
    console.log("update successfully");
  } catch (error) {
    console.log(error);
    throw error;
  }
});

cron.schedule("59 23 * * 0", async () => {
  console.log("weekly schedule");
  try {
    const users = await userRepository.getRecapUsers();
    const reports = await reportRepository.getReportByType("MINGGUAN");

    for (const user of users) {
      const saveToDB = await userRepository.saveToMonthlyDb({
        id: user.id,
        name: user.name,
        nip: user.nip,
        division: user.division,
        email: user.email,
        password: user.password,
        phone_number: user.phone_number,
        address: user.address,
        role: user.role,
        status: user.status,
        days: user.days,
        recapType: "BULANAN",
        userId: user.id,
      });
      if (saveToDB) {
        await userRepository.deleteUsers();
      } else {
        console.log("no data to save");
      }
    }
    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "BULANAN");
    }
    console.log("updated");
  } catch (error) {
    throw error;
  }
});

cron.schedule("0 0 1 * *", async () => {
  console.log("monthly schedule");
  try {
    const user = await userRepository.getUsersByReportType("BULANAN");

    for (const users of user) {
      await userRepository.deleteMonthlyUsers();
      await reportRepository.deleteReport("BULANAN");
    }

    const uploadDirectory = "public/uploads";

    const currentTime = new Date();

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

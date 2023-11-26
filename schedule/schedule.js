const path = require("path");
const fs = require("fs");
const userRepository = require("../repositories/userRepository");
const reportRepository = require("../repositories/reportRepository");

const dayCron = async () => {
  try {
    const users = await userRepository.getUsers();
    const reports = await reportRepository.getReportByType("HARIAN");

    for (const user of users) {
      const saveToDb = await userRepository.saveToNewDb({
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
        userId: user.id,
      });
      if (saveToDb) {
        await userRepository.updateUserStatus(user.id, "alpha");
      }
    }

    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "MINGGUAN", users.id);
    }
  } catch (error) {
    throw error;
  }
};

const weekCron = async () => {
  try {
    const reports = await reportRepository.getReportByType("MINGGUAN");

    for (const report of reports) {
      await reportRepository.updateReportType(report.id, "BULANAN");
    }
  } catch (error) {
    throw error;
  }
};

const monthCron = async () => {
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
};

module.exports = { dayCron, weekCron, monthCron };

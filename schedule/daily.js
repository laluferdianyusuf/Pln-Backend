const userRepository = require("../repositories/userRepository");
const reportRepository = require("../repositories/reportRepository");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const dailyCron = async (event, context) => {
  console.log("daily schedule");
  try {
    const users = await userRepository.getUsers();

    const reports = await reportRepository.getReportByType("HARIAN");
    const nowDays = dayjs().tz("Asia/Makassar");

    const createdAt = nowDays.format("dddd D MMMM YYYY HH:mm");

    for (const user of users) {
      if (user.division !== "supervisor") {
        const saveToDB = await userRepository.saveToNewDb({
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
          const updatedStatus = await userRepository.updateUserStatus(
            user.id,
            "alpha"
          );
          if (updatedStatus) {
            for (const report of reports) {
              const dailyUsers = await userRepository.getRecapUsers();
              const monthlyUsers = await userRepository.getMonthlyRecapUsers();
              await reportRepository.updateReportType(
                report.id,
                "MINGGUAN",
                dailyUsers.id,
                monthlyUsers.id
              );
            }
          }
          console.log("updated");
        } else {
          console.log("no data to save");
        }
      } else {
        console.log("User is a Supervisor, skipping");
      }
    }

    console.log("update successfully");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  dailyCron,
};

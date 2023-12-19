const cloudinary = require("../utils/cloudinary");
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
        const savedUser = await userRepository.saveToNewDb({
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

        if (savedUser) {
          const updatedStatus = await userRepository.updateUserStatus(
            user.id,
            "alpha"
          );
          if (updatedStatus) {
            for (const report of reports) {
              if (report.createdById === user.id) {
                await reportRepository.updateReportTypeAndDaily(
                  report.id,
                  "MINGGUAN",
                  savedUser.id
                );
              }
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

const weeklyCron = async (event, context) => {
  console.log("weekly schedule");
  try {
    const users = await userRepository.getRecapUsers();
    const reports = await reportRepository.getReportByType("MINGGUAN");

    for (const user of users) {
      const saveToDB = await userRepository.saveToMonthlyDb({
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
        recapId: user.id,
      });

      if (saveToDB) {
        for (const report of reports) {
          if (report.dailyRecapId === user.id) {
            const updatedStatus =
              await reportRepository.updateReportTypeAndMonthly(
                report.id,
                "BULANAN",
                saveToDB.id
              );
            if (updatedStatus) {
              console.log("Report updated successfully");
            }
          }
        }
        console.log("User data saved successfully");
      } else {
        console.log("No data to save for user");
      }
    }

    // Now that all data is saved, delete users
    await userRepository.deleteUsers();

    console.log("All data updated and users deleted");
  } catch (error) {
    console.error("An error occurred:", error);
    // Handle the error appropriately, e.g., log it or throw a new error
  }
};

const oneMonthInSeconds = 30 * 24 * 60 * 60;

const monthlyCron = async (event, context) => {
  console.log("monthly schedule");
  try {
    const user = await userRepository.getUsersByReportType("BULANAN");

    for (const users of user) {
      await userRepository.deleteMonthlyUsers(users.id);
      await reportRepository.deleteReport("BULANAN");
    }

    const cloudinaryResources = await cloudinary.api.resources({
      type: "upload",
      max_results: 1000,
      context: true,
    });

    const currentTime = Math.floor(Date.now() / 1000);
    for (const resource of cloudinaryResources.resources) {
      const uploadTimestamp = Math.floor(
        new Date(resource.created_at).getTime() / 1000
      );
      const ageInSeconds = currentTime - uploadTimestamp;

      if (ageInSeconds > oneMonthInSeconds) {
        const publicId = resource.public_id;

        try {
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted from Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
          console.error("Error deleting from Cloudinary:", cloudinaryError);
        }
      }
    }
    console.log("successful");
  } catch (error) {
    console.log("error: " + error);
    throw error;
  }
};

module.exports = {
  dailyCron,
  weeklyCron,
  monthlyCron,
};

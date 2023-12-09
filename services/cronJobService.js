const cloudinary = require("../utils/cloudinary");
const userRepository = require("../repositories/userRepository");
const reportRepository = require("../repositories/reportRepository");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

class CronJob {
  static async dailyCron() {
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
                const monthlyUsers =
                  await userRepository.getMonthlyRecapUsers();
                await reportRepository.updateReportType(
                  report.id,
                  "MINGGUAN",
                  dailyUsers.id,
                  monthlyUsers.id
                );
              }
              console.log("updated");
            }
          } else {
            console.log("no data to update");
          }
        } else {
          console.log("user is supervisor, skipping");
        }
      }
    } catch (error) {
      console.log("Internal server error", error);
    }
  }

  static async weeklyCron() {
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
          userId: user.id,
        });
        if (saveToDB) {
          await userRepository.deleteUsers();
          return {
            status_info: true,
            status_code: 201,
            message: "saved successfully",
            data: saveToDB,
          };
        } else {
          return {
            status_info: false,
            status_code: 400,
            message: "No data to save",
            data: null,
          };
        }
      }
      for (const report of reports) {
        await reportRepository.updateReportType(report.id, "BULANAN");
      }
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }

  static async monthlyCron() {
    const oneMonthInSeconds = 30 * 24 * 60 * 60;
    try {
      const user = await userRepository.getUsersByReportType("BULANAN");

      for (const users of user) {
        await userRepository.deleteMonthlyUsers();
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
            return {
              status_info: true,
              status_code: 203,
              message: "Successfully deleted Cloudinary",
              data: result,
            };
          } catch (cloudinaryError) {
            console.error("Error deleting from Cloudinary:", cloudinaryError);
            return {
              status_info: false,
              status_code: 403,
              message: "Error deleting from Cloudinary",
              data: null,
            };
          }
        }
      }
      return {
        status_info: true,
        status_code: 200,
        message: "Successfully",
      };
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }
}
module.exports = CronJob;

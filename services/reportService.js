const reportRepository = require("../repositories/reportRepository.js");
const userRepository = require("../repositories/userRepository.js");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const cloudinary = require("../utils/cloudinary");
dayjs.extend(utc);
dayjs.extend(timezone);

class ReportService {
  static async createReport({
    id,
    JTM,
    JTR,
    Gardu,
    SRAPP,
    TB9,
    TB12,
    TB13,
    description,
    type,
    createdById,
    image,
  }) {
    try {
      const user = await userRepository.getById({ id });

      const nowWITA = dayjs().tz("Asia/Makassar");
      type = "HARIAN";

      const today = nowWITA.format("dddd D MMMM YYYY");
      const createdAt = nowWITA.format("dddd D MMMM YYYY HH:mm");

      let pictures = "";

      if (image) {
        const fileBase64 = image.buffer.toString("base64");
        const file = `data:${image.mimetype};base64,${fileBase64}`;
        const cloudinaryPicture = await cloudinary.uploader.upload(file);
        pictures = cloudinaryPicture.url;
      } else {
        pictures = getUsersById.picture;
      }

      // if (user.status === "waiting") {
      //   const existingReport = await reportRepository.getReportByCreatedAtAndId(
      //     {
      //       createdById: user.id,
      //       createdAt: today,
      //     }
      //   );

      //   if (existingReport && existingReport.length > 0) {
      //     const startIndex = existingReport[0].image.lastIndexOf("/") + 1;
      //     const endIndex = existingReport[0].image.lastIndexOf(".");
      //     const imageToDelete = existingReport[0].image.substring(
      //       startIndex,
      //       endIndex
      //     );
      //     const existingReportId = existingReport[0].id;
      //     await cloudinary.uploader.destroy(imageToDelete);
      //     await reportRepository.deleteReportById(existingReportId);
      //   }
      // }

      if (user.status === "approved") {
        return {
          status_info: false,
          status_code: 401,
          message: "Your Report has already been approved",
          data: null,
        };
      }

      const reportData = {
        JTM,
        JTR,
        Gardu,
        SRAPP,
        TB9,
        TB12,
        TB13,
        description,
        type,
        createdById,
        createdAt: createdAt,
        image: pictures,
      };

      const report = await reportRepository.createReport(reportData);
      if (report) {
        await userRepository.updateUserStatus(user.id, "waiting");

        return {
          status_info: true,
          status_code: 201,
          message: "Successfully created report",
          data: report,
        };
      } else {
        return {
          status_info: false,
          status_code: 404,
          message: "Unsuccessful",
          data: null,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }

  static async getAllReports() {
    try {
      const reports = await reportRepository.getAllReports();
      if (reports && reports.length > 0) {
        // Group reports by createdAt and createdBy
        const reportsByDateAndUser = reports.reduce((acc, report) => {
          const dateKey = dayjs(report.createdAt).format("D MMMM YYYY HH:mm");
          const userKey = report.createdById;

          if (!acc[dateKey]) {
            acc[dateKey] = {};
          }

          if (!acc[dateKey][userKey]) {
            acc[dateKey][userKey] = [];
          }

          acc[dateKey][userKey].push(report);

          return acc;
        }, {});

        const result = await Promise.all(
          Object.entries(reportsByDateAndUser).map(
            async ([dateKey, userReportsByDate], indexes) => {
              const formattedDate = dayjs(dateKey, "D MMMM YYYY HH:").format(
                "D MMMM YYYY"
              );
              const formattedDateTanggal = dayjs(
                dateKey,
                "D MMMM YYYY HH:mm"
              ).format("HH:mm");

              const users = await Promise.all(
                Object.entries(userReportsByDate).map(
                  async ([userKey, userReports]) => {
                    // Sort reports for each user and date by createdAt
                    userReports.sort(
                      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                    );

                    const user = await userRepository.getById({ id: userKey });

                    const reports = userReports.map((report, index) => {
                      return {
                        Jam: formattedDateTanggal,
                        "Nama Pekerjaan": {
                          "JTM (Kms)": parseFloat(report.JTM),
                          "Gardu (Unit)": parseFloat(report.Gardu),
                          "JTR (Kms)": parseFloat(report.JTR),
                          "SR/APP (Pelanggan)": parseFloat(report.SRAPP),
                          "TIANG BETON": {
                            "9 Meter (BTG)": parseFloat(report.TB9),
                            "12 Meter (BTG)": parseFloat(report.TB12),
                            "13 Meter (BTG)": parseFloat(report.TB13),
                          },
                        },
                        DESCRIPTION: report.description,
                      };
                    });

                    return {
                      createdBy: user.name,
                      reports,
                    };
                  }
                )
              );

              return {
                No: indexes + 1,
                Date: formattedDate,
                users,
              };
            }
          )
        );

        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: result,
        };
      } else {
        return {
          status_info: false,
          status_code: 404,
          message: "No Reports found",
          data: null,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }

  static async getReportByUserDivision({ division }) {
    const user = await userRepository.getByDivision({ division });
    const report = await reportRepository.getAllReportsByDivision();

    if (user) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: report,
      };
    } else {
      return {
        status_info: false,
        status_code: 404,
        message: "No data found",
        data: null,
      };
    }
  }

  static async getReportByCreatedAt({ createdAt }) {
    try {
      const reports = await reportRepository.getReportByCreatedAt({
        createdAt,
      });

      if (reports && reports.length > 0) {
        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: reports,
        };
      } else {
        return {
          status_info: false,
          status_code: 404,
          message: "No data found",
          data: null,
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }

  static async getReportByCreatedById({ createdById }) {
    const report = await reportRepository.getReportByCreatedBy({
      createdById: createdById,
    });

    if (report && report.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: report,
      };
    } else {
      return {
        status_info: false,
        status_code: 400,
        message: "No data found",
        data: null,
      };
    }
  }
  static async getReportByRecapId({ dailyRecapId }) {
    const report = await reportRepository.getReportByRecapId({
      dailyRecapId: dailyRecapId,
    });

    if (report && report.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: report,
      };
    } else {
      return {
        status_info: false,
        status_code: 400,
        message: "No data found",
        data: null,
      };
    }
  }
  static async getReportByMonthlyId({ monthlyRecapId }) {
    const report = await reportRepository.getReportByMonthlyId({
      monthlyRecapId: monthlyRecapId,
    });

    if (report && report.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: report,
      };
    } else {
      return {
        status_info: false,
        status_code: 400,
        message: "No data found",
        data: null,
      };
    }
  }
}

module.exports = ReportService;

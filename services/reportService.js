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

      if (user.status === "waiting") {
        const existingReport = await reportRepository.getReportByCreatedAtAndId(
          {
            createdById: user.id,
            createdAt: today,
          }
        );

        const startIndex = existingReport[0].image.lastIndexOf("/") + 1;
        const endIndex = existingReport[0].image.lastIndexOf(".");
        const imageToDelete = existingReport[0].image.substring(
          startIndex,
          endIndex
        );

        if (existingReport) {
          const existingReportId = existingReport[0].id;
          await cloudinary.uploader.destroy(imageToDelete);
          await reportRepository.deleteReportById(existingReportId);
        }
      }

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
      if (reports) {
        const uniqueDates = Array.from(
          new Set(reports.map((report) => report.createdAt))
        );
        let No = 1;
        const result = uniqueDates.map((Tanggal) => {
          const formattedDate = dayjs(Tanggal).format("D MMMM YYYY");
          const reportsOnDate = reports.filter(
            (report) => report.createdAt === Tanggal
          );
          const JTM = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.JTM),
            0
          );
          const JTR = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.JTR),
            0
          );
          const Gardu = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.Gardu),
            0
          );
          const SRAPP = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.SRAPP),
            0
          );
          const totalTB9 = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.TB9),
            0
          );
          const totalTB12 = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.TB12),
            0
          );
          const totalTB13 = reportsOnDate.reduce(
            (acc, report) => acc + parseInt(report.TB13),
            0
          );
          const firstDescription =
            reportsOnDate.length > 0 ? reportsOnDate[0].description : null;

          return {
            No: No++,
            Tanggal: formattedDate,
            "Nama Pekerjaan": {
              "JTM (Kms)": JTM,
              "Gardu (Unit)": Gardu,
              "JTR (Kms)": JTR,
              "SR/APP (Pelanggan)": SRAPP,
              "TIANG BETON": {
                "9 Meter (BTG)": totalTB9,
                "12 Meter (BTG)": totalTB12,
                "13 Meter (BTG)": totalTB13,
              },
            },
            DESCRIPTION: firstDescription,
          };
        });

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
    }
  }

  static async getReportByCreatedAt({ createdAt }) {
    try {
      const reports = await reportRepository.getReportByCreatedAt({
        createdAt,
      });

      if (reports) {
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
          message: "Not Found",
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

    if (report) {
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
        message: "Failed",
        data: null,
      };
    }
  }
}

module.exports = ReportService;

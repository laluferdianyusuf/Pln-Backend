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
    kms,
    description,
    type,
    createdById,
    image,
  }) {
    try {
      const user = await userRepository.getById({ id });

      if (user.status === "waiting") {
        return {
          status_info: false,
          status_code: 401,
          message: "You are reported today",
          data: null,
        };
      } else if (user.status === "approved") {
        return {
          status_info: false,
          status_code: 401,
          message: "Your Report is Approved",
          data: null,
        };
      }

      const nowWITA = dayjs().tz("Asia/Makassar");
      type = "HARIAN";

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

      const reportData = {
        kms,
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

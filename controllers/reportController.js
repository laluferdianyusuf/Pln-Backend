const reportService = require("../services/reportService");

const createReport = async (req, res) => {
  try {
    const { description, type } = req.body;
    const user = req.users.id;

    const image = req.file;
    const { status_info, status_code, message, data } =
      await reportService.createReport({
        id: user,
        description,
        type,
        createdById: user,
        image,
      });

    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Gagal membuat laporan." });
  }
};

const getReportByUserDivision = async (req, res) => {
  try {
    const { division } = req.params;

    const { status_info, status_code, message, data } =
      await reportService.getReportByUserDivision({ division: division });
    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    throw error;
  }
};

const getReportByCreatedById = async (req, res) => {
  try {
    const { createdById } = req.params;

    const { status_info, status_code, message, data } =
      await reportService.getReportByCreatedById({ createdById: createdById });

    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createReport,
  getReportByUserDivision,
  getReportByCreatedById,
};

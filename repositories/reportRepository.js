const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportRepository {
  static async createReport({
    description,
    type,
    createdById,
    createdAt,
    image,
    dailyRecaptId,
  }) {
    const report = await prisma.report.create({
      data: {
        description,
        type,
        createdById,
        createdAt,
        image,
        dailyRecaptId,
      },
    });
    return report;
  }

  static async getReportById(reportId) {
    return await prisma.report.findUnique({
      where: { id: reportId },
    });
  }

  static async getReportByCreatedBy({ createdById }) {
    return await prisma.report.findFirst({
      where: { createdById: parseInt(createdById) },
    });
  }

  static async getAllReportsByDivision() {
    return await prisma.report.findMany({});
  }

  static async getReportByType(type) {
    try {
      const report = await prisma.report.findMany({
        where: {
          type: type,
        },
      });
      return report;
    } catch (error) {
      throw error;
    }
  }

  static async updateReportType(reportId, newType, newRecapId) {
    try {
      const updatedReport = await prisma.report.update({
        where: {
          id: reportId,
        },
        data: {
          type: newType,
          dailyRecaptId: newRecapId,
        },
      });
      return updatedReport;
    } catch (error) {
      throw error;
    }
  }

  static async deleteReport(type) {
    try {
      const deletedReport = await prisma.report.deleteMany({
        where: {
          type: type,
        },
      });
      return deletedReport;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ReportRepository;

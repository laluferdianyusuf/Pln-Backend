const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ReportRepository {
  static async createReport({
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
    createdAt,
    image,
  }) {
    const report = await prisma.report.create({
      data: {
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
        createdAt,
        image,
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

  static async getAllReports() {
    const reports = await prisma.report.findMany();

    return reports;
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

  static async getReportByCreatedAt({ createdAt }) {
    try {
      const reports = await prisma.report.findMany({
        where: {
          createdAt: { contains: createdAt },
        },
      });

      return reports;
    } catch (error) {
      console.error("Error fetching report by report createdAt:", error);
      throw error;
    }
  }

  static async updateReportType(reportId, newType, newDailyId, newMonthlyId) {
    try {
      const updatedReport = await prisma.report.update({
        where: {
          id: reportId,
        },
        data: {
          type: newType,
          dailyRecapId: newDailyId,
          monthlyRecapId: newMonthlyId,
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

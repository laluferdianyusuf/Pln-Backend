const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function convertToISODate(dateString) {
  const dateObject = new Date(dateString);
  const day = dateObject.getDate();
  const month = dateObject.toLocaleString("default", { month: "long" });
  const year = dateObject.getFullYear();

  return `${day} ${month} ${year}`;
}

class UserRepository {
  static async createUser({
    name,
    nip,
    division,
    email,
    password,
    phone_number,
    address,
    role,
  }) {
    const user = await prisma.user.create({
      data: {
        name,
        nip,
        division,
        email,
        password,
        phone_number,
        address,
        role,
      },
    });
    return user;
  }

  static async createSupervisor({
    name,
    nip,
    division,
    email,
    password,
    phone_number,
    address,
    role,
    status,
  }) {
    const user = await prisma.user.create({
      data: {
        name,
        nip,
        division,
        email,
        password,
        phone_number,
        address,
        role,
        status,
      },
    });
    return user;
  }

  static async getByEmail({ email }) {
    try {
      const user = await prisma.user.findFirst({ where: { email: email } });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async getUsers() {
    const user = await prisma.user.findMany();
    return user;
  }

  static async saveToNewDb(data) {
    try {
      const user = await prisma.dailyRecap.create({
        data: {
          id: data.id,
          name: data.name,
          nip: data.nip,
          division: data.division,
          email: data.email,
          password: data.password,
          phone_number: data.phone_number,
          address: data.address,
          role: data.role,
          status: data.status,
          days: data.days,
          userId: data.id,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getByDivision({ division }) {
    try {
      const user = await prisma.user.findMany({
        where: { division: division },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by division: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async getRecapByDivision({ division }) {
    try {
      const user = await prisma.dailyRecap.findMany({
        where: { division: division },
      });
      return user;
    } catch (error) {
      throw new Error(`Failed to get user by division: ${error.message}`);
    } finally {
      await prisma.$disconnect();
    }
  }

  static async getById({ id }) {
    try {
      const userId = parseInt(id);
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return user;
    } catch (error) {
      console.error("Error retrieving user by ID: ", error);
      throw error;
    }
  }

  static async getByStatus({ status }) {
    try {
      const user = await prisma.user.findMany({
        where: { status: status },
      });

      return user;
    } catch (error) {
      console.error("Error retrieving user by ID: ", error);
      throw error;
    }
  }

  static async updateUserStatus(userId, newStatus) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { status: newStatus },
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user status: ", error);
      throw error;
    }
  }

  static async updateUserRecapStatus(userId, newStatus) {
    try {
      const updatedUser = await prisma.dailyRecap.update({
        where: { id: userId },
        data: { status: newStatus },
      });
      return updatedUser;
    } catch (error) {
      console.error("Error updating user status: ", error);
      throw error;
    }
  }

  static async getUsersByReportType({ reportType }) {
    try {
      const users = await prisma.user.findMany({
        where: {
          reports: {
            some: {
              type: reportType,
            },
          },
        },
      });

      return users;
    } catch (error) {
      console.error("Error retrieving users by report type:", error);
      throw error;
    }
  }

  static async getUsersByReportCreatedAt({ reportCreatedAt, division }) {
    try {
      const isoCreatedAt = convertToISODate(reportCreatedAt);
      const users = await prisma.dailyRecap.findMany({
        where: {
          division: division,
          days: { contains: isoCreatedAt },
        },
      });

      return users;
    } catch (error) {
      console.error("Error fetching users by report createdAt:", error);
      throw error;
    }
  }

  static async getUsersByReportByDay({ day, division }) {
    try {
      const users = await prisma.dailyRecap.findMany({
        where: {
          division: division,
          days: { contains: day },
        },
      });

      return users;
    } catch (error) {
      console.error("Error fetching users by report createdAt:", error);
      throw error;
    }
  }

  static async deleteUsers() {
    try {
      const deletedUser = await prisma.dailyRecap.deleteMany();
      return deletedUser;
    } catch (error) {
      console.error(`Error deleting user:`, error);
      throw error;
    }
  }
}

module.exports = UserRepository;

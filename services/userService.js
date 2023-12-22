const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT, ROLES } = require("../lib/const");
const ReportRepository = require("../repositories/reportRepository");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const cloudinary = require("../utils/cloudinary");
dayjs.extend(utc);
dayjs.extend(timezone);
const SALT_ROUND = 10;

class UserService {
  static async register({
    name,
    nip,
    division,
    email,
    password,
    phone_number,
    address,
    role,
  }) {
    try {
      if (
        !name ||
        !nip ||
        !division ||
        !email ||
        !password ||
        !phone_number ||
        !address
      ) {
        return {
          status_info: false,
          status_code: 400,
          message: "All fields are required",
          data: {
            user: null,
          },
        };
      }

      if (name.length > 20) {
        return {
          status_info: false,
          status_code: 400,
          message: "Name can't be more than 20 characters",
          data: {
            user: null,
          },
        };
      }

      if (password.length < 8) {
        return {
          status_info: false,
          status_code: 400,
          message: "Password must be at least 8 characters long",
          data: {
            user: null,
          },
        };
      }

      role = "employee";

      const users = await userRepository.getByEmail({ email });

      if (users) {
        return {
          status_info: false,
          status_code: 400,
          message: "Email has already been used",
          data: {
            user: null,
          },
        };
      } else {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

        const createdUser = await userRepository.createUser({
          name,
          nip,
          division,
          email,
          password: hashedPassword,
          phone_number,
          address,
          role,
        });

        return {
          status_info: true,
          status_code: 201,
          message: "User successfully registered",
          data: {
            user: createdUser,
          },
        };
      }
    } catch (err) {
      return {
        status_info: false,
        status_code: 500,
        message: err.message,
        data: {
          user: null,
        },
      };
    }
  }

  static async registerSupervisor({
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
    try {
      if (!name || !nip || !email || !password || !phone_number || !address) {
        return {
          status_info: false,
          status_code: 400,
          message: "All fields are required",
          data: {
            user: null,
          },
        };
      }

      if (password.length < 8) {
        return {
          status_info: false,
          status_code: 400,
          message: "Password must be at least 8 characters long",
          data: {
            user: null,
          },
        };
      }

      division = "supervisor";
      role = ROLES.SUPERVISOR;
      status = "supervisor";

      const getUserEmail = await userRepository.getByEmail({ email });

      if (getUserEmail) {
        return {
          status_info: false,
          status_code: 400,
          message: "Email has already been used",
          data: {
            user: null,
          },
        };
      } else {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

        const createdUser = await userRepository.createSupervisor({
          name,
          nip,
          division,
          email,
          password: hashedPassword,
          phone_number,
          address,
          role,
          status,
        });

        return {
          status_info: true,
          status_code: 201,
          message: "Supervisor successfully registered",
          data: {
            user: createdUser,
          },
        };
      }
    } catch (err) {
      return {
        status_info: false,
        status_code: 500,
        message: err.message,
        data: {
          user: null,
        },
      };
    }
  }

  static async login({ email, password }) {
    try {
      if (!email || !password) {
        return {
          status_info: false,
          status_code: 400,
          message: "Email and password are required",
          data: {
            user: null,
          },
        };
      }

      const getUser = await userRepository.getByEmail({ email });

      if (!getUser) {
        return {
          status_info: false,
          status_code: 400,
          message: "Invalid Email Try Again",
          data: {
            user: null,
          },
        };
      } else {
        const isPassTrue = await bcrypt.compare(password, getUser.password);

        if (isPassTrue) {
          const token = jwt.sign(
            {
              id: getUser.id,
              email: getUser.email,
            },
            JWT.SECRET,
            {
              expiresIn: JWT.EXPIRED,
            }
          );

          return {
            status_info: true,
            status_code: 200,
            message: "Login successful",
            data: {
              token,
              getUser,
            },
          };
        } else {
          return {
            status_info: false,
            status_code: 400,
            message: "Wrong Password Try Again",
            data: {
              user: null,
            },
          };
        }
      }
    } catch (err) {
      return {
        info: false,
        status_code: 500,
        message: err.message,
        data: {
          user: null,
        },
      };
    }
  }

  static async getAllUsers() {
    try {
      const users = await userRepository.getUsers();

      if (users) {
        const filteredUsers = users.filter(
          (user) => user.division !== "supervisor"
        );

        if (filteredUsers.length > 0) {
          return {
            status_info: true,
            status_code: 200,
            message: "Get All Users (excluding supervisors)",
            data: {
              users: filteredUsers,
            },
          };
        } else {
          return {
            status_info: false,
            status_code: 400,
            message: "No Users Available (excluding supervisors)",
            data: {
              users: null,
            },
          };
        }
      } else {
        return {
          status_info: false,
          status_code: 400,
          message: "No Users Available",
          data: {
            users: null,
          },
        };
      }
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error" + error,
        data: {
          users: null,
        },
      };
    }
  }

  static async getUserDivision({ division }) {
    // const divisionsArray = division.split("/").map((item) => item.trim());

    const user = await userRepository.getByDivision({
      division: division,
    });

    if (user && user.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    } else {
      return {
        status_info: false,
        status_code: 404,
        message: "No Users",
        data: null,
      };
    }
  }

  static async getUserById({ id }) {
    const user = await userRepository.getById({ id });

    if (user && user.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    } else {
      return {
        status_info: false,
        status_code: 404,
        message: "No Users",
        data: null,
      };
    }
  }

  static async getRecapUserDivision({ division }) {
    const user = await userRepository.getRecapByDivision({ division });

    if (user && user.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    } else {
      return {
        status_info: false,
        status_code: 404,
        message: "No users",
        data: null,
      };
    }
  }

  static async updateUserStatusBySupervisor({ id }) {
    try {
      const user = await userRepository.getById({ id });
      if (user.status === "waiting") {
        const updatedUser = await userRepository.updateUserStatus(
          user.id,
          "approved"
        );

        return {
          status_info: true,
          status_code: 201,
          message: "Report Approved",
          data: updatedUser,
        };
      } else if (user.status === "approved") {
        return {
          status_info: false,
          status_code: 400,
          message: "Already Approved",
          data: null,
        };
      } else {
        return {
          status_info: false,
          status_code: 400,
          message: "User not reported yet",
          data: null,
        };
      }
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Error: " + error.message,
        data: null,
      };
    }
  }
  static async updateDailyStatusBySupervisor({ id }) {
    try {
      const user = await userRepository.getDailyById({ id });
      if (user.status === "waiting") {
        const updatedUser = await userRepository.updateUserRecapStatus(
          user.id,
          "approved"
        );

        return {
          status_info: true,
          status_code: 201,
          message: "Report Approved",
          data: updatedUser,
        };
      } else if (user.status === "approved") {
        return {
          status_info: false,
          status_code: 400,
          message: "Already Approved",
          data: null,
        };
      } else {
        return {
          status_info: false,
          status_code: 400,
          message: "User not reported yet",
          data: null,
        };
      }
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Error: " + error.message,
        data: null,
      };
    }
  }
  static async updateMonthlyStatusBySupervisor({ id }) {
    try {
      const user = await userRepository.getMonthlyById({ id });
      if (user.status === "waiting") {
        const updatedUser = await userRepository.updateMonthlyRecapStatus(
          user.id,
          "approved"
        );

        return {
          status_info: true,
          status_code: 201,
          message: "Report Approved",
          data: updatedUser,
        };
      } else if (user.status === "approved") {
        return {
          status_info: false,
          status_code: 400,
          message: "Already Approved",
          data: null,
        };
      } else {
        return {
          status_info: false,
          status_code: 400,
          message: "User not reported yet",
          data: null,
        };
      }
    } catch (error) {
      return {
        status_info: false,
        status_code: 500,
        message: "Error: " + error.message,
        data: null,
      };
    }
  }

  static async deleteUserById({ id }) {
    try {
      const user = await userRepository.getById({ id });

      const nowWITA = dayjs().tz("Asia/Makassar");

      const today = nowWITA.format("dddd D MMMM YYYY");

      if (!user) {
        return {
          status_info: false,
          status_code: 404,
          message: "User not found",
          data: {
            user: null,
          },
        };
      }

      const existingReports = await ReportRepository.getReportByCreatedAtAndId({
        createdById: user.id,
        createdAt: today,
      });

      for (const existingReport of existingReports) {
        const startIndex = existingReport.image.lastIndexOf("/") + 1;
        const endIndex = existingReport.image.lastIndexOf(".");
        const imageToDelete = existingReport.image.substring(
          startIndex,
          endIndex
        );

        try {
          await cloudinary.uploader.destroy(imageToDelete);
        } catch (cloudinaryError) {
          console.error(
            "Error deleting image from Cloudinary:",
            cloudinaryError
          );
        }
        await ReportRepository.deleteReportByCreatedById(user.id);
      }

      await userRepository.deleteUserById(user.id);
      await userRepository.deleteUserDailyById(user.id);
      await userRepository.deleteMonthlyUsers(user.id);

      return {
        status_info: true,
        status_code: 200,
        message: "User deleted successfully",
        data: {
          user: user,
        },
      };
    } catch (error) {
      console.error("Error deleting user:", error);

      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: {
          user: null,
        },
      };
    }
  }

  static async getUsersByReportType({ reportType }) {
    const user = await userRepository.getUsersByReportType({ reportType });

    if (user && user.length > 0) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    } else {
      return {
        status_info: false,
        status_code: 404,
        message: "No users",
        data: null,
      };
    }
  }

  static async getUsersByReportCreatedAt({ reportCreatedAt, division }) {
    try {
      // const divisionsArray = division.split("/").map((item) => item.trim());
      const users = await userRepository.getUsersByReportCreatedAt({
        reportCreatedAt,
        division: division,
      });

      if (users && users.length > 0) {
        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: users,
        };
      } else {
        return {
          status_info: false,
          status_code: 404,
          message: "No Users",
          data: null,
        };
      }
    } catch (error) {
      // Handle errors, log them, and return an appropriate response
      console.error("Error fetching users by report created at:", error);
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }

  static async getUsersByReportByDay({ day, division }) {
    try {
      // const divisionsArray = division.split("/").map((item) => item.trim());
      const users = await userRepository.getUsersByReportByDay({
        day,
        division: division,
      });

      if (users && users.length > 0) {
        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: users,
        };
      } else {
        return {
          status_info: false,
          status_code: 404,
          message: "No Users",
          data: null,
        };
      }
    } catch (error) {
      // Handle errors, log them, and return an appropriate response
      console.error("Error fetching users by report created at:", error);
      return {
        status_info: false,
        status_code: 500,
        message: "Internal Server Error",
        data: null,
      };
    }
  }
}

module.exports = UserService;

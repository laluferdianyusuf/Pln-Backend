const userRepository = require("../repositories/userRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT, ROLES } = require("../lib/const");
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
        if (createdUser) {
          await userRepository.saveToNewDb({
            name: createdUser.name,
            nip: createdUser.nip,
            division: createdUser.division,
            email: createdUser.email,
            password: createdUser.password,
            phone_number: createdUser.phone_number,
            address: createdUser.address,
            role: createdUser.role,
            status: createdUser.status,
          });
        }

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

  static async getUserDivision({ division }) {
    const user = await userRepository.getByDivision({ division });

    if (user) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
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

  static async getUserById({ id }) {
    const user = await userRepository.getById({ id });

    if (user) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    }
  }

  static async getRecaptUserDivision({ division }) {
    const user = await userRepository.getRecaptByDivision({ division });

    if (user) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
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

  static async getUsersByReportType({ reportType }) {
    const user = await userRepository.getUsersByReportType({ reportType });

    if (user) {
      return {
        status_info: true,
        status_code: 200,
        message: "Success",
        data: user,
      };
    }
  }

  static async getUsersByReportCreatedAt({ reportCreatedAt, division }) {
    try {
      const users = await userRepository.getUsersByReportCreatedAt({
        reportCreatedAt,
        division,
      });

      if (users) {
        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: users,
        };
      } else {
        return {
          status_info: false,
          status_code: 401,
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
      const users = await userRepository.getUsersByReportByDay({
        day,
        division,
      });

      if (users) {
        return {
          status_info: true,
          status_code: 200,
          message: "Success",
          data: users,
        };
      } else {
        return {
          status_info: false,
          status_code: 401,
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

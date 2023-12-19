const userService = require("../services/userService");

const register = async (req, res) => {
  const { name, nip, division, email, password, phone_number, address, role } =
    req.body;

  const { status_info, status_code, message, data } =
    await userService.register({
      name,
      nip,
      division,
      email,
      password,
      phone_number,
      address,
      role,
    });

  res.status(status_code).send({
    status_info: status_info,
    message: message,
    data: data,
  });
};

const registerSupervisor = async (req, res) => {
  const {
    name,
    nip,
    division,
    email,
    password,
    phone_number,
    address,
    role,
    status,
  } = req.body;

  const { status_info, status_code, message, data } =
    await userService.registerSupervisor({
      name,
      nip,
      division,
      email,
      password,
      phone_number,
      address,
      role,
      status,
    });

  res.status(status_code).send({
    status_info: status_info,
    message: message,
    data: data,
  });
};

const currentUser = async (req, res) => {
  const currentUser = req.users;

  res.status(200).send({
    status: true,
    message: "You are logged in with this user",
    data: {
      user: currentUser,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { status_info, status_code, message, data } = await userService.login({
    email,
    password,
  });

  res.status(status_code).send({
    status_info: status_info,
    message: message,
    data: data,
  });
};

const getAllUsers = async (req, res) => {
  const { status_info, status_code, message, data } =
    await userService.getAllUsers();

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const getUserDivision = async (req, res, next) => {
  const { division } = req.params;

  const { status_info, status_code, message, data } =
    await userService.getUserDivision({ division: division });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const getUserById = async (req, res, next) => {
  const { id } = req.params;

  const { status_info, status_code, message, data } =
    await userService.getUserById({ id: id });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const getRecapUserDivision = async (req, res, next) => {
  const { division } = req.params;

  const { status_info, status_code, message, data } =
    await userService.getRecapUserDivision({ division: division });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const updateUserBySupervisor = async (req, res, next) => {
  const { id } = req.params;

  const { status_info, status_code, message, data } =
    await userService.updateUserStatusBySupervisor({ id: id });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};
const updateDailyBySupervisor = async (req, res, next) => {
  const { id } = req.params;

  const { status_info, status_code, message, data } =
    await userService.updateDailyStatusBySupervisor({ id: id });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};
const updateMonthlyBySupervisor = async (req, res, next) => {
  const { id } = req.params;

  const { status_info, status_code, message, data } =
    await userService.updateMonthlyStatusBySupervisor({ id: id });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const deleteUserById = async (req, res, next) => {
  const { id } = req.params;

  const { status_info, status_code, message, data } =
    await userService.deleteUserById({ id: id });

  res
    .status(status_code)
    .send({ status_info: status_info, message: message, data: data });
};

const getUserByReportType = async (req, res) => {
  try {
    const { reportType } = req.params;
    const { status_info, status_code, message, data } =
      await userService.getUsersByReportType({ reportType });

    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    throw error;
  }
};

const getUsersByReportCreatedAt = async (req, res) => {
  try {
    const { reportCreatedAt, division } = req.params;

    const { status_info, status_code, message, data } =
      await userService.getUsersByReportCreatedAt({
        reportCreatedAt,
        division,
      });

    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    throw error;
  }
};

const getUsersByReportByDay = async (req, res) => {
  try {
    const { day, division } = req.params;

    const { status_info, status_code, message, data } =
      await userService.getUsersByReportByDay({
        day,
        division,
      });

    res
      .status(status_code)
      .send({ status_info: status_info, message: message, data: data });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  registerSupervisor,
  login,
  getAllUsers,
  currentUser,
  getUserDivision,
  getUserById,
  updateUserBySupervisor,
  updateDailyBySupervisor,
  updateMonthlyBySupervisor,
  deleteUserById,
  getUserByReportType,
  getRecapUserDivision,
  getUsersByReportCreatedAt,
  getUsersByReportByDay,
};

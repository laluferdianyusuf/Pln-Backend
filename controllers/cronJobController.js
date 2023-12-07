const CronJob = require("../services/cronJobService");

const dailyCron = async (req, res) => {
  try {
    await CronJob.dailyCron();

    res.status(200).send("Succesfully completed");
  } catch (error) {
    throw Error;
  }
};
const weeklyCron = async (req, res) => {
  try {
    await CronJob.weeklyCron();

    res.status(200).send("Succesfully completed");
  } catch (error) {
    throw Error;
  }
};
const monthlyCron = async (req, res) => {
  try {
    await CronJob.monthlyCron();

    res.status(200).send("Succesfully completed");
  } catch (error) {
    throw Error;
  }
};

module.exports = {
  dailyCron,
  weeklyCron,
  monthlyCron,
};

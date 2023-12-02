// vercel-function.js
const runSchedule = require("./schedule/cron");

module.exports = async function (req, res) {
  try {
    console.log("Running scheduled function at:", new Date());

    // Panggil fungsi cron
    runSchedule();

    res.status(200).send("Scheduled function executed successfully.");
  } catch (error) {
    console.error("Error running scheduled function:", error);
    res.status(500).send("Internal Server Error");
  }
};

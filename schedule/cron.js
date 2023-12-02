const schedule = require("node-schedule");
const { dailyCron, weeklyCron, monthlyCron } = require("./schedule/cronJob");

function scheduleMinutes() {
  schedule.scheduleJob("* * * * *", function () {
    console.log("Running every minute");
    dailyCron();
  });
}

function scheduleDailyCron() {
  schedule.scheduleJob("59 22 * * *", function () {
    console.log("Running dailyCron at:", new Date());
    dailyCron();
  });
}

// Fungsi untuk menjalankan cron mingguan pada jam 23:59 setiap hari Minggu
function scheduleWeeklyCron() {
  schedule.scheduleJob("59 22 * * 0", function () {
    console.log("Running weeklyCron at:", new Date());
    weeklyCron();
  });
}

// Fungsi untuk menjalankan cron bulanan pada jam 23:59 setiap tanggal 1 bulan
function scheduleMonthlyCron() {
  schedule.scheduleJob("59 22 1 * *", function () {
    console.log("Running monthlyCron at:", new Date());
    monthlyCron();
  });
}

function runSchedules() {
  scheduleMinutes();
  scheduleDailyCron();
  scheduleWeeklyCron();
  scheduleMonthlyCron();
}

module.exports = runSchedules;

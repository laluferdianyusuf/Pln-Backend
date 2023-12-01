const multer = require("multer");

const storage = multer.memoryStorage();

const limits = {
  fileSize: 1024 * 1024 * 5,
};

module.exports = multer({
  storage: storage,
  limits: limits,
});

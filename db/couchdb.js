const nano = require("nano");

const couchDBUrl = "https://ruler:ruler@192.168.57.254:5984";
const nanoInstance = nano(couchDBUrl);

const db = nanoInstance.db.use("h_db");

module.exports = db;

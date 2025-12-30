const express = require("express");
const router = express.Router();

const issueController = require("../controllers/issueController");

const jwtAuth = require("../middleware/jwtAuth");


// TEST
router.get("/test", issueController.testDB);

// GET ALL ISSUES (PROTECTED)
router.get("/issues", jwtAuth, issueController.getAllIssues);

// GET ISSUE BY ID (PROTECTED)
router.get("/issues/:id", jwtAuth, issueController.getIssueById);

// CREATE ISSUE (PROTECTED)
router.post("/issues", jwtAuth, issueController.createIssue);

// UPDATE ISSUE (PROTECTED)
router.put("/issues/:id", jwtAuth, issueController.updateIssue);

// DELETE ISSUE (PROTECTED)
router.delete("/issues/:id", issueController.deleteIssue);

module.exports = router;

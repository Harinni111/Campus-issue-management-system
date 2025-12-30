const db = require("../db/couchdb");

// TEST
exports.testDB = async (req, res) => {
  try {
    const doc = await db.get("101");
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET ALL ISSUES
exports.getAllIssues = async (req, res) => {
  try {
    const { role, department, userId } = req.user;

    let selector = { type: "ISSUE" };

    if (role === "EMPLOYEE") {
      selector["createdBy.userId"] = userId;
    }

    if (role === "MANAGER") {
      selector.department = department;
    }

    const result = await db.find({ selector });
    res.json(result.docs);
  } catch (err) {
    console.error("Fetch issues error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET ISSUE BY ID
exports.getIssueById = async (req, res) => {
  try {
    const doc = await db.get(req.params.id);
    res.json(doc);
  } catch (err) {
    res.status(404).json({ error: "Issue not found" });
  }
};

// CREATE ISSUE
exports.createIssue = async (req, res) => {
  try {
    const { title, description, department } = req.body;

    const issue = {
      type: "ISSUE",
      title,
      description,
      department,
      status: "OPEN",
      createdAt: new Date().toISOString(),

      createdBy: {
        userId: req.user.userId,
        username: req.user.username
      },

      // NEW: initialize history
      history: []
    };

    const response = await db.insert(issue);

    res.status(201).json({
      message: "Issue created",
      id: response.id
    });
  } catch (err) {
    console.error("Create issue error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE ISSUE
exports.updateIssue = async (req, res) => {
  try {
    const issueId = req.params.id;
    const { role, userId, department, username } = req.user;

    const issue = await db.get(issueId);

    // Ensure history exists (important for old issues)
    if (!issue.history) {
      issue.history = [];
    }

    // ---------------- EMPLOYEE ----------------
    if (role === "EMPLOYEE") {
      if (issue.createdBy.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      if (!["OPEN", "IN_PROGRESS"].includes(issue.status)) {
        return res.status(400).json({
          error: "Issue cannot be edited in current status"
        });
      }

      const { title, description } = req.body;

      if (title && title !== issue.title) {
        issue.history.push({
          action: "TITLE_UPDATED",
          from: issue.title,
          to: title,
          by: { userId, username, role },
          timestamp: new Date().toISOString()
        });
        issue.title = title;
      }

      if (description && description !== issue.description) {
        issue.history.push({
          action: "DESCRIPTION_UPDATED",
          by: { userId, username, role },
          timestamp: new Date().toISOString()
        });
        issue.description = description;
      }

      await db.insert(issue);
      return res.json({ message: "Issue updated successfully" });
    }

    // ---------------- MANAGER ----------------
    if (role === "MANAGER") {
      if (issue.department !== department) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { status, remark } = req.body;

      if (status && status !== issue.status) {
        issue.history.push({
          action: "STATUS_CHANGED",
          from: issue.status,
          to: status,
          by: { userId, username, role },
          timestamp: new Date().toISOString()
        });
        issue.status = status;
      }

      if (remark) {
        issue.history.push({
          action: "REMARK_ADDED",
          remark,
          by: { userId, username, role },
          timestamp: new Date().toISOString()
        });
        issue.remark = remark;
      }

      await db.insert(issue);
      return res.json({ message: "Issue updated successfully" });
    }

    // ---------------- ADMIN ----------------
    if (role === "ADMIN") {
      Object.assign(issue, req.body);

      issue.history.push({
        action: "ADMIN_UPDATED",
        by: { userId, username, role },
        timestamp: new Date().toISOString()
      });

      await db.insert(issue);
      return res.json({ message: "Issue updated successfully" });
    }

    return res.status(403).json({ error: "Forbidden" });

  } catch (err) {
    if (err.statusCode === 404) {
      return res.status(404).json({ error: "Issue not found" });
    }

    console.error("Update issue error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE ISSUE
exports.deleteIssue = async (req, res) => {
  try {
    const doc = await db.get(req.params.id);
    await db.destroy(doc._id, doc._rev);
    res.json({ message: "Issue deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

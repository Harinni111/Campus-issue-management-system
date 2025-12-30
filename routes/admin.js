const express = require("express");
const router = express.Router();

const db = require("../db/couchdb");
const jwtAuth = require("../middleware/jwtAuth");

//  ADMIN GUARD
function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}

/* -----------------------------------------
   GET ALL USERS (ADMIN DASHBOARD)
----------------------------------------- */
router.get("/users", jwtAuth, adminOnly, async (req, res) => {
  try {
    const result = await db.find({
      selector: { type: "USER" },
      fields: [
        "_id",
        "username",
        "firstName",
        "lastName",
        "department",
        "email",
        "role",
        "status"
      ]
    });

    res.json(result.docs);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------------------
   GET PENDING USERS ONLY
----------------------------------------- */
router.get("/users/pending", jwtAuth, adminOnly, async (req, res) => {
  try {
    const result = await db.find({
      selector: {
        type: "USER",
        role: "EMPLOYEE",
        status: "PENDING"
      },
      fields: [
        "_id",
        "username",
        "firstName",
        "lastName",
        "department",
        "email",
        "status"
      ]
    });

    res.json(result.docs);
  } catch (err) {
    console.error("Fetch pending users error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -----------------------------------------
   APPROVE USER (PENDING → ACTIVE)
----------------------------------------- */
router.put(
  "/users/:username/approve",
  jwtAuth,
  adminOnly,
  async (req, res) => {
    try {
      const userId = `user:${req.params.username}`;
      const userDoc = await db.get(userId);

      if (userDoc.status !== "PENDING") {
        return res
          .status(400)
          .json({ error: "User is not pending approval" });
      }

      userDoc.status = "ACTIVE";
      await db.insert(userDoc);

      res.json({
        message: `User ${userDoc.username} approved successfully`
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ error: "User not found" });
      }

      console.error("Approve user error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/* -----------------------------------------
   PROMOTE EMPLOYEE → MANAGER
----------------------------------------- */
router.put(
  "/users/:username/promote",
  jwtAuth,
  adminOnly,
  async (req, res) => {
    try {
      const userId = `user:${req.params.username}`;
      const userDoc = await db.get(userId);

      if (userDoc.role !== "EMPLOYEE") {
        return res.status(400).json({
          error: "Only employees can be promoted"
        });
      }

      if (userDoc.status !== "ACTIVE") {
        return res.status(400).json({
          error: "User must be ACTIVE to promote"
        });
      }

      userDoc.role = "MANAGER";
      await db.insert(userDoc);

      res.json({
        message: `User ${userDoc.username} promoted to MANAGER`
      });
    } catch (err) {
      if (err.statusCode === 404) {
        return res.status(404).json({ error: "User not found" });
      }

      console.error("Promote user error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;

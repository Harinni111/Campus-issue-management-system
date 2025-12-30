const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const signupSchema = require("../validators/signupSchema");
const loginSchema = require("../validators/loginSchema");
const userRepo = require("../db/userRepo");
const jwtAuth = require("../middleware/jwtAuth");
const router = express.Router();


router.get("/me", jwtAuth, (req, res) => {
  res.json({
    username: req.user.username,
    role: req.user.role,
    department: req.user.department
  });
});


router.post("/signup", async (req, res) => {
  try {
    //  Validate input
    const { error, value } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const {
      username,
      firstName,
      lastName,
      dob,
      email,
      address,
      gender,
      department,
      password
    } = value;

    //  Calculate age
    const birthDate = new Date(dob);
    const age =
      new Date().getFullYear() - birthDate.getFullYear();

    if (age < 18 || age > 100) {
      return res
        .status(400)
        .json({ error: "Age must be between 18 and 100" });
    }

    // Username uniqueness
    const existingUser = await userRepo.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // Email uniqueness
    const emailTaken = await userRepo.isEmailTaken(email);
    if (emailTaken) {
      return res.status(409).json({ error: "Email already exists" });
    }

    //  Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    //  Create user
    await userRepo.createUser({
      username,
      firstName,
      lastName,
      dob,
      email,
      address,
      gender,
      department,
      passwordHash,
      role: "EMPLOYEE",
      status: "PENDING"
    });

    return res.status(201).json({
      message:
        "Signup successful. Your account is pending admin approval."
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    //  Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const { username, password } = value;

    // Fetch user
    const user = await userRepo.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //  Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check status
    if (user.status !== "ACTIVE") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    //  Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        username: user.username,
        role: user.role,
        department: user.department
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    //  Set cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false, // set true when HTTPS is enabled
      sameSite: "lax",
      maxAge: 60 * 60 * 1000 // 1 hour
    });
    

    // Success response
    res.json({
      message: "Login successful",
      role: user.role,
      department: user.department
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

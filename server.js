process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require("dotenv").config();              //  ADD

const bcrypt = require("bcrypt");        //  ADD
const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const issueRoutes = require("./routes/issues");
const db = require("./db/couchdb");          //  ADD (your existing db connection)

const PORT = 3000;
const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));
// ROOT REDIRECT → LOGIN PAGE
app.get("/", (req, res) => {
  res.redirect("/auth/login.html");
});


// ---------------- SEEDED ADMIN LOGIC ---------------- //  ADD
async function seedAdmin() {
  try {
    const result = await db.find({
      selector: { role: "ADMIN" },
      limit: 1
    });

    if (result.docs.length > 0) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    const adminUser = {
      _id: `user:${process.env.ADMIN_USERNAME}`, //  REQUIRED
      type: "USER",                              //  REQUIRED

      username: process.env.ADMIN_USERNAME,
      firstName: "System",
      lastName: "Admin",
      email: process.env.ADMIN_EMAIL,
      role: "ADMIN",
      department: "SYSTEM",
      passwordHash: hashedPassword,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };


    await db.insert(adminUser);
    console.log("Seeded admin user successfully");

  } catch (err) {
    console.error("Error seeding admin:", err.message);
  }
}
// --------------------------------------------------- //
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
// routes
app.use("/", issueRoutes);

// start server
app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  // SEED ADMIN ON SERVER START
  await seedAdmin();
});


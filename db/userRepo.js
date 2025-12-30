const db = require("./couchdb");

/**
 * USER DOCUMENT STRUCTURE
 * _id        : user:<username>
 * type       : USER
 * role       : ADMIN | MANAGER | EMPLOYEE
 * status     : PENDING | ACTIVE
 */

/**
 * Get user by username
 * Uses semantic _id → fast lookup
 */
async function getUserByUsername(username) {
  try {
    return await db.get(`user:${username}`);
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

/**
 * Check if email already exists
 * Enforces email uniqueness
 */
async function isEmailTaken(email) {
  const result = await db.find({
    selector: {
      type: "USER",
      email: email
    },
    limit: 1
  });

  return result.docs.length > 0;
}

/**
 * Create a new user document
 * Username uniqueness is enforced by _id
 */
async function createUser({
  username,
  firstName,
  lastName,
  dob,
  email,
  address,
  gender,
  department,
  role,
  status,
  passwordHash
}) {
  const userDoc = {
    _id: `user:${username}`,
    type: "USER",

    username,
    firstName,
    lastName,
    dob,
    email,
    address,
    gender,
    department,

    role,       // EMPLOYEE | MANAGER | ADMIN
    status,     // PENDING | ACTIVE

    passwordHash,
    createdAt: new Date().toISOString()
  };

  return await db.insert(userDoc);
}

module.exports = {
  getUserByUsername,
  isEmailTaken,
  createUser
};

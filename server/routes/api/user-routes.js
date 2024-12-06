const router = require("express").Router();
const { createUser, login, getSingleUser } = require("../../controllers/user-controller");

// Import middleware
const { authMiddleware } = require("../../utils/auth");

// Routes for user actions
// /api/user - User signup
router.route("/").post(createUser);

// /api/user/login - User login
router.route("/login").post(login);

// /api/user/me - Get single user data
router.route("/me").get(authMiddleware, getSingleUser);

module.exports = router;

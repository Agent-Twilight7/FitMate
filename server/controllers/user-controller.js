const { User } = require("../models");
const { signToken } = require("../utils/auth");

module.exports = {
  // Get a single user by ID or username
  async getSingleUser({ user = null, params }, res) {
    try {
      const foundUser = await User.findOne({
        $or: [{ _id: user ? user._id : params.id }, { username: params.username }],
      })
        .select("-__v")
        .populate("cardio")
        .populate("resistance");

      if (!foundUser) {
        return res.status(404).json({
          message: "User not found. Ensure the provided ID or username is correct.",
        });
      }

      res.json(foundUser);
    } catch (error) {
      res.status(500).json({
        message: "Server error while fetching user data.",
        error: error.message,
      });
    }
  },

  // Create a user, sign a token, and send it back to the client
  async createUser({ body }, res) {
    try {
      // Check for duplicate username or email
      await User.checkUserExistence(body.username, body.email);

      const user = await User.create(body);
      const token = signToken(user);

      res.json({ token, user });
    } catch (error) {
      const validationErrors = parseValidationError(error);
      res.status(400).json({
        message: "Sign-up failed. Please fix the following issues:",
        errors: validationErrors,
      });
    }
  },

  // Login a user, sign a token, and send it back to the client
  async login({ body }, res) {
    try {
      const user = await User.findOne({
        $or: [{ username: body.username }, { email: body.email }],
      });

      if (!user) {
        return res.status(404).json({
          message: "User not found. Please check the username or email.",
        });
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        return res.status(401).json({
          message: "Incorrect password. Please try again.",
        });
      }

      const token = signToken(user);
      res.json({ token, user });
    } catch (error) {
      res.status(500).json({
        message: "Login failed due to a server error.",
        error: error.message,
      });
    }
  },
};

// Helper function to extract and format validation errors
function parseValidationError(error) {
  if (error.name === "ValidationError") {
    // Handle validation errors (e.g., missing fields, invalid input)
    return Object.values(error.errors).map((err) => {
      if (err.kind === "minlength") {
        return `${err.path} must be at least ${err.properties.minlength} characters long.`;
      }
      if (err.kind === "required") {
        return `${err.path} is required.`;
      }
      if (err.kind === "regexp") {
        return `${err.path} is invalid. Please provide a valid ${err.path}.`;
      }
      return err.message;
    });
  }

  if (error.message.includes("duplicate key")) {
    // Handle duplicate key errors (e.g., username or email already exists)
    const field = error.message.includes("username") ? "username" : "email";
    return [`The ${field} is already in use. Please choose another one.`];
  }

  // Unknown errors
  return [error.message];
}

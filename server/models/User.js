const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  username: {
    type: String,
    trim: true,
    unique: true,
    required: "Username is required",
    minlength: [3, "Username must be at least 3 characters long"], // Minimum 3 characters
  },
  password: {
    type: String,
    trim: true,
    required: "Password is required",
    minlength: [6, "Password must be at least 6 characters long"], // Minimum 6 characters
  },
  email: {
    type: String,
    unique: true,
    required: "Email is required",
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  cardio: [
    {
      type: Schema.Types.ObjectId,
      ref: "Cardio",
    },
  ],
  resistance: [
    {
      type: Schema.Types.ObjectId,
      ref: "Resistance",
    },
  ],
});

// Hash user password before saving
UserSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    if (this.password && this.password.length < 6) {
      next(new Error("Password must be at least 6 characters long"));
    }
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// Custom method to compare and validate password for logging in
UserSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Static method to check for duplicate username or email
UserSchema.statics.checkUserExistence = async function (username, email) {
  const existingUser = await this.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    const errors = [];
    if (existingUser.username === username) errors.push("Username is already taken");
    if (existingUser.email === email) errors.push("Email is already taken");
    throw new Error(errors.join(", "));
  }
};

const User = model("User", UserSchema);

module.exports = User;

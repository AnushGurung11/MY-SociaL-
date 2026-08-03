import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      unique: true,
      required: true,
      trim: true,
      auto: true,
    },
    username: {
      type: String,
      minlength: 5,
      maxlength: 50,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      required: true,
    },
    phone: {
      type: String,
    },
    DOB: {
      type: Date,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    password: {
      type: String,
      minlength: 8,
      select: false,
      required: true,
    },
    last_login: {
      type: Date,
      default: Date.now,
    },
    active_status: {
      type: String,
      enum: ["active", "inactive", "banned", "deleted"],
      default: "active",
    },
  },
  { timestamps: true },
);

// This async fuction is running before saving the credentials to the database
// The password is hashed and then replaced with the initial password
userSchema.pre("save", async function () {
  const saltRound = 10;
  const hashed_password = await bcrypt.hash(this.password, saltRound);
  this.password = hashed_password;
});

// This is a method for this class where it will checked the provied password and compare to the exisiting password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("user", userSchema);

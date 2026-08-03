import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";

export const register = async (req, res) => {
  try {
    const { username, email, phone, DOB, password } = req.body;

    // first checking of any empty fields
    if (!username || !email || !DOB || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      phone,
      DOB,
      password,
    });

    // Token generation after successful registration
    const token = generateToken(newUser._id, newUser.role);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        DOB: newUser.DOB,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

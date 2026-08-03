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

    // Create a new user in database
    const newUser = await User.create({
      username,
      email,
      phone,
      DOB,
      password,
    });

    // Json response for a newly registered user with a status code of 201
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
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Checking for any empty fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields" });
    }

    // Check if the user exists
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res.status(400).json({ message: "User does not exist" });
    }

    // Check if the password is correct
    const isPasswordCorrect = await userExists.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // If the password is correct, then we generate a token for the user

    //first creating a payload for the token which will be used to generate the token
    const payload = {
      userID: userExists._id,
      role: userExists.role,
    };

    const token = generateToken(payload);

    res.status(200).json({
      message: "User logged in successfully",
      user: {
        _id: userExists._id,
        username: userExists.username,
        email: userExists.email,
        phone: userExists.phone,
        DOB: userExists.DOB,
        role: userExists.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

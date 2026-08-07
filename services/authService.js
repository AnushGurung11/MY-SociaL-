import { generateToken } from "../utils/token.js";
import {
  createUser,
  loginExistingUser,
  existingUser,
} from "../repository/userRepository.js";

export const register = async (userData) => {
  try {
    const { username, email, DOB, password } = userData;

    // first checking of any empty fields
    if (!username || !email || !DOB || !password) {
      return {
        status: 400,
        message: "Please fill in all required fields",
      };
    }

    // Check if the user already exists
    const checkExistingUser = await existingUser(email);

    if (checkExistingUser != null) {
      return {
        status: 400,
        message: "User already exists",
      };
    }

    // Create a new user in database
    const newUser = await createUser(userData);

    // Json response for a newly registered user with a status code of 201
    return {
      status: 201,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        DOB: newUser.DOB,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error("Error registering user:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

export const login = async (userData) => {
  try {
    const { email, password } = userData;

    console.log(email);
    console.log(password);

    // Checking for any empty fields
    if (!email || !password) {
      return {
        status: 400,
        message: "Please fill in all required fields",
      };
    }

    // Check if the user exists
    const userExists = await loginExistingUser(email);
    console.log(userExists);

    if (userExists == null) {
      return {
        status: 400,
        message: "User does not exist",
      };
    }

    // Check if the password is correct
    const isPasswordCorrect = await userExists.comparePassword(password);
    console.log(isPasswordCorrect);

    if (!isPasswordCorrect) {
      return {
        status: 400,
        message: "Invalid password",
      };
    }

    // If the password is correct, then we generate a token for the user

    //first creating a payload for the token which will be used to generate the token
    const payload = {
      userID: userExists._id,
      role: userExists.role,
    };

    console.log(payload);

    const token = generateToken(payload);

    console.log(token);

    return {
      status: 200,
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
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return {
      status: 500,
      message: "Internal server error",
    };
  }
};

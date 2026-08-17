import express from "express"; // for creating the server
import http from "http"; // for creating the http server (required by socket.io)
import cors from "cors"; // communication establishing between frontend and backend.
import dotenv from "dotenv"; // for loading environment variables from a .env file
import { authRouter } from "./routes/authRoutes.js"; // importing the auth routes
import { connectDB } from "./config/dbConfig.js"; // importing the database connection function
import { initializeSocket } from "./config/socket.js"; // importing the socket.io setup
import cookieParser from "cookie-parser";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

dotenv.config(); // loading environment variables from .env file

const app = express(); // creating the express server
app.use(cookieParser());
app.disable("x-powered-by"); // disabling the x-powered-by header for security reasons

// configiring cors to allow requests from the frontend
const corsConfig = {
  origin: process.env.CLIENT_URL || `http://localhost:${process.env.PORT}`,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsConfig)); // enabling CORS for all routes
app.use(express.json()); // for parsing application/json

// These are the routes setted up
app.use("/api/auth", authRouter);
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/posts", require("./routes/postRoutes"));
// app.use("/api/comments", require("./routes/commentRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT; // setting up the port for the server

// The socket.io server needs an http server instead of the express app directly
const httpServer = http.createServer(app);
initializeSocket(httpServer, corsConfig);

httpServer.listen(PORT, async () => {
  try {
    await connectDB().then(() => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}); // starting the server and listening on the specified port

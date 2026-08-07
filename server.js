import express from "express"; // for creating the server
import cors from "cors"; // communication establishing between frontend and backend.
import dotenv from "dotenv"; // for loading environment variables from a .env file
import { authRouter } from "./routes/authRoutes.js"; // importing the auth routes
import { connectDB } from "./config/dbConfig.js"; // importing the database connection function

dotenv.config(); // loading environment variables from .env file

const app = express(); // creating the express server
app.disable("x-powered-by"); // disabling the x-powered-by header for security reasons

// configiring cors to allow requests from the frontend
const corsConfig = {
  origin: `http://localhost:${process.env.PORT}`,
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

const PORT = process.env.PORT; // setting up the port for the server
const DBURL = process.env.MONGO_URI; // importing the database connection function

app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, async () => {
  try {
    await connectDB(DBURL).then(() => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Connected to the database`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
}); // starting the server and listening on the specified port

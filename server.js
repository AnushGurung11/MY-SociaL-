require("dotenv").config(); // for accessing the env variables
import express from "express"; // for creating the server
import cors from "cors"; // communication establishing between frontend and backend. 

const app = express(); // creating the express server 

app.use(cors()); // enabling CORS for all routes
app.use(express.json()); // for parsing application/json

// These are the routes setted up

// app.use("/api/auth", require("./routes/authRoutes"));
// app.use("/api/users", require("./routes/userRoutes"));
// app.use("/api/posts", require("./routes/postRoutes"));
// app.use("/api/comments", require("./routes/commentRoutes"));

const PORT = process.env.PORT || 3000;  // setting up the port for the server

app.use((err, req, res,next) => {  
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});// error handling middleware

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});// starting the server and listening on the specified port
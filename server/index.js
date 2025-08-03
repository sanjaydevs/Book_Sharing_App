console.log("Server is starting");

import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import authRoutes from "./routes/authroutes.js";
import bookRoutes from "./routes/bookroutes.js";
import requestRoutes from "./routes/requestroutes.js";
import messages from "./routes/messages.js";

dotenv.config();

const app=express();

// CORS configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ message: "BookExchange API is running!", timestamp: new Date().toISOString() });
});

app.get("/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/messages", messages);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server listening on Port ${PORT}`))
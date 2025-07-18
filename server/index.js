console.log("Server is starting");

import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import authRoutes from "./routes/authroutes.js";
import bookRoutes from "./routes/bookroutes.js";

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server listening on Port ${PORT}`))
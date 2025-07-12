console.log("Server is starting");

import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import pool from "./db.js"

dotenv.config();

const app=express();
app.use(cors());
app.use(express.json());


app.get("/api/test", async (req,res)=>{
    try{
        const result = await pool.query("SELECT NOW()");
        res.json({db_time: result.rows[0].now});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error : "Database connection failed"});
    }
})
const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=> console.log(`Server listening on Port ${PORT}`))
import pool from "../db.js";
import express from "express";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/:book_id", verifyToken, async (req,res)=>{
    const book_id = req.params.book_id;
    const requester_id = req.user.userId;

    try {
        const check = await pool.query("Select * from requests where book_id = $1 and requester_id = $2", [book_id, requester_id]);
        
        if (check.rows.length > 0) {
            res.status(400).json({message:"Request already sent"};)
        }

        await pool.query("INSERT INTO requests (book_id,requester_id) VALUES ($1,$2)",[book_id,requester_id]);

        res.status(200).json({message:"Request Sent successfully"})

    } catch(err){
        console.error(err.message);
        res.status(500).json({erroe:"Server error"});
    }
});
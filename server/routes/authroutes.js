import express from "express";
import pool from "../db.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router= express.Router();

router.post("/register", async (req,res)=>{
    const {name,email,password} = req.body;

    try {
        const userCheck = await pool.query("Select * from users where email =$1", [email]);
        if (userCheck.rows.length > 0){
            return res.status(400).json({error : "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const result = await pool.query("Insert into users (name,email,password) values ($1,$2,$3) returning id,name,email",
            [name,email,hashedPassword]
        );

        const token = jwt.sign({userId:result.rows[0].id}, process.env.JWT_SECRET,{
            expiresIn:"7d"
        });


        res.status(201).json({
            user:result.rows[0],
            token
        })
    } catch (err){
        console.error("Register error:", err.message);
        res.status(500).json({error:"Server Error"});
    }
});


router.post("/login", async (req,res)=>{
    const {email,password} = req.body;

    try{
        const userResult = await pool.query("Select * From users WHERE email = $1",[email]);
        const user=userResult.rows[0];

        if (!user){
            return res.status(404).json({error:"User not found"});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(401).json({error:"Invalid Credentials"});
        }

        const token = jwt.sign({userId:user.id}, process.env.JWT_SECRET, {expiresIn:"7d"});

        res.json({
            user:{
                id:user.id,
                name:user.name,
                email:user.email
            },
            token
        });
    } catch (err){
        console.error("Login Error:",err.message);
        res.status(500).json({error:"Server Error"});
    }
});

export default router
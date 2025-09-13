import express from "express";
import pool from "../db.js"
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import verifyToken from "../middleware/verifyToken.js";

const BACKEND_URL = process.env.BACKEND_URL;

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
        console.error("Register error:", err);
        res.status(500).json({error:"Server Error"});
    }
});


router.post("/login", async (req,res)=>{
    const {email,password} = req.body;

    try{
        console.log("Login route called in backend");
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

router.post("/me",verifyToken, async (req,res)=>{
    try{
        const userResult = await pool.query("SELECT id,name,email FROM users WHERE id = $1",[req.user.userId]);
        res.json({user : userResult.rows[0]});
    } catch(err) {
        res.status(500).json({error: "Server error"})
    }
})

router.get("/google", (req, res) => {
  const redirect_uri = `${BACKEND_URL}/api/auth/google/callback`;
  const client_id = process.env.GOOGLE_CLIENT_ID;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`;

  res.redirect(url);
});
router.get("/google/callback", async (req, res) => {
    const code = req.query.code;

    const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${BACKEND_URL}/api/auth/google/callback`
);

    try {
        // Exchange code for tokens
        const { tokens } = await client.getToken({
            code,
            redirect_uri: `${BACKEND_URL}/api/auth/google/callback`
        });
        client.setCredentials(tokens);

        // Decode ID token
        const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    // Check DB for user
    let userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = userResult.rows[0];

    if (!user) {
        const result = await pool.query(
        "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id,name,email",
        [name, email, "google-oauth"] // password = null for Google users
        );
        user = result.rows[0];
    }

    // Create JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
    } catch (err) {
        console.error("Google OAuth error:", err);
        res.status(500).json({ error: "Google login failed" });
    }
});

export default router
import jwt from "jsonwebtoken";

const verifyToken=(req,res,next)=>{
    const authheader = req.headers.authorization;


    if (!authheader || !authheader.startsWith("Bearer ")){
        return res.status(401).json({ error: "No token provided"})
    }

    const token = authheader.split(" ")[1]

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch(err) {
        return res.status(403).json({error:"Invalid token"})
    }
};

export default verifyToken;
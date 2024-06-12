const jwt=require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const jwtMiddleware=(req,res,next)=>{

    //first check request header has authorization or not
    const authorization=req.headers.authorization;

    if(!authorization){
        return res.status(401).json({
            error:"unauthorized"
        })    
    }

    //extract token from header
    const token=req.headers.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({
            error:"unauthorized"
        })
    }

    try{

        //verify token
        const decoded=jwt.verify(token,JWT_SECRET);

        //attatch user info to the request object
        req.user=decoded;

        next();
    }
    catch(err){

        console.error(err);
        res.status(401).json({
            error:"invalid token"
        })

    }
}

const generateToken=(userData)=>{
    //generate jwt token using userData
    return jwt.sign(userData,JWT_SECRET)
}

module.exports={jwtMiddleware,generateToken}; 
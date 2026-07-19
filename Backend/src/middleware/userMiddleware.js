const jwt = require('jsonwebtoken');
const redisClient = require("../config/redis");
const User = require("../models/user");

const userMiddleware = async (req,res,next) =>{
    try{
        const {token} = req.cookies;
        if(!token){
            throw new Error('Token is not present');
        }

       const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

       const {_id} = payload;

       if(!_id){
        throw new Error('Invalid token');
       }

       const result = await User.findOne({_id: _id});

       if(!result){
            throw new Error("User Doesn't Exist");
       }

       //Redis ke blocklist mein present toh nahi hai
       const IsBlocked = await redisClient.exists(`token: ${token}`);
       if(IsBlocked)
            throw new Error('Invalid Token');

       req.result = result;

       next();

    }
    catch(err){
        res.status(401).send("Error: "+err.message);
    }
}

module.exports = userMiddleware;
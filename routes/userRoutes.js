const express=require('express');

const router=express.Router();

const User=require('../models/user');

const {jwtMiddleware,generateToken}=require('../jwt')



//signup and return token
router.post('/signup',async (req,res)=>{
    try{
        //extract data from req body
        const data=req.body;

        //check if already there is admin
        const adminUser=await User.findOne({role:"admin"});
        if(data.role=='admin' && adminUser){
            return res.status(400).json({
                msg:"admin already exixts"
            })
        }

        //create new user document
        const newUser=new User(data);





        //save new user to database

        const response=await newUser.save();
        console.log("new user saved");

        const payload={
            id:response.id
        }

        console.log(JSON.stringify(payload));
        const token=generateToken(payload);
        console.log("token is ", token);

        res.status(200).json({response:response,token:token});




    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})

    }
})



//login and return token
router.post('/login',async (req,res)=>{
    console.log("hi")

    try{
        //extract aadharcard number from body
        const {aadharCardNumber,password}=req.body;

        //find user by aadhar card
        console.log(aadharCardNumber)
        console.log(password)
        const user=await User.findOne({aadharCardNumber:aadharCardNumber});
        //if aadhar does not exixts or pass does not match
        console.log(user.comparePassword(password))
        if(!user || !(user.comparePassword(password)) ){
            return res.status(401).json({
                error:"invalid username and password"
            })
        }

        //generate token
        const payload={
            id:user.id
        }

        const token=generateToken(payload);
        res.json(token);

    }
    catch(err){
        res.status(401).json({error:"internal server error"})
    }
})


//profile route
router.get('/profile',jwtMiddleware,async (req,res)=>{


    try{
        const userData=req.user;
        const userId=userData.id;
        const user=await User.findById(userId);
        res.status(200).json({user});

    }
    catch(err){
        res.json("internal server error")

    }
})


router.put('/profile/password',jwtMiddleware,async(req,res)=>{
    try{
        //get id from jwt middleware and corrosponding to that id change pass 
        const userid=req.user.id;
        const Userbyid=await User.findById(userid);
        // if(!userid){
        //     res.status(401).json({error:"unauthorized"})
        // }

        //check password match or not
        //extract current and new password 
        const {currentPassword,newPassword}=req.body;

        console.log(currentPassword);
        console.log(Userbyid.password)
        console.log(Userbyid.comparePassword(currentPassword))
        if(Userbyid.comparePassword(currentPassword)){
            Userbyid.password=newPassword
            console.log("hi")
            await Userbyid.save();
            console.log("bye")
        }
        else{
            res.status(401).json({
                error:"wrong current password"
            })
        }
        res.status(200).json({
            msg:"password changes successfully"
        })
    }
    catch(err){

        res.status(500).json({error:"internal server error"});
    }
})







module.exports=router
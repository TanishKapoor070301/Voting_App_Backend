const express=require('express');

const router=express.Router();

const Candidate=require('../models/candidate')
const User=require('../models/user')

const {jwtMiddleware,generateToken}=require('../jwt')



//function to check that role is admin or not


const checkAdminRole=async (userID)=>{
    try{

        const user=await User.findById(userID);
        console.log(user.role)

        if(user.role=='admin'){
            return true;
        }
        return false;

    }
    catch(err){

        return false;

    }
}



//post route to add candidate
router.post('/addCandidate',jwtMiddleware,async (req,res)=>{
    try{

        console.log(req.user.id)
        console.log(checkAdminRole(req.user.id))
        //use await as this function is async
        if(await checkAdminRole(req.user.id)){
        //extract data from req body
        const data=req.body;

        //create new user document
        const newCandidate=new Candidate(data);

        //save new user to database

        const response=await newCandidate.save();
        console.log("new candidate saved");

        res.status(200).json({response:response});
        }
        else{
        return res.status(404).json({msg:"you cant do this u r not admin"})
        }

    }
    catch(err){
        console.log(err);
        res.status(500).json({error:"internal server error"})

    }
})



// http://localhost:3000/candidate/id

router.put('/:candidateID',jwtMiddleware,async(req,res)=>{
    console.log("hi")
    try{
        console.log("ki")

        //put method on that user krega jo admin hoga
        if(!(await checkAdminRole(req.user.id))){
            return res.status(404).json({
                message:"user has not admin role"
            })
        }


        const candidateID=req.params.candidateID;
        const updatedCandidateData=req.body;
        const response=await Candidate.findByIdAndUpdate(candidateID,updatedCandidateData,{
            new:true, //return updated document
            runValidators:true // run mongoose validators
        })

        if(!response){
            return res.status(404).json({
                error:"candidate not found"
            })
        }

        res.status(200).json({response})
    }
    catch(err){

        res.status(500).json({error:"internal server error"});
    }
})

router.delete('/:candidateID',jwtMiddleware,async (req,res)=>{
    try{
        console.log("hi")

        if(!checkAdminRole(req.user.id)){
            return res.status(403).json({
                msg:"user does not have admin access"
            })
        }

        const candidateID=req.params.candidateID;
        const response=await Candidate.findByIdAndDelete(candidateID);

        if(!response){
            return res.status(404).json({
                msg:"no candidate with this  id"
            })
        }
        res.status(200).json({
            "response":response,
            "msg":"deleted successfully"
        })



    }
    catch(err){
        res.status(500).json("internal server error")

    }
})


//let user vote to a candidate
//1 user vote only once
//admin cant vote
//if user vote , make user schema me vote ko true
//user vote dega jis candidate ko make that candidate votes array me usko add


router.post('/vote/:candidateID',jwtMiddleware,async (req,res)=>{

    candidateID=req.params.candidateID;
    userID=req.user.id;

    try{
        //find candidate document by specific candidateid
        const candidate=await Candidate.findById(candidateID);

        if(!candidate){
            res.status(404).json({
                "message":"candidate not found"
            })
        }

        const user=await User.findById(userID);
        if(!user){
            return res.status(404).json({
                msg:"user not found"
            })
        }

        if(user.role=="admin"){
            return res.status(404).json({
                msg:"ypu are admin u cant vote"
            })
        }

        if(user.isVoted){
            return res.status(404).json({
                msg:"user already voted"
            })
        }


        //updateCandidatedocument
        candidate.votes.push({user:userID});
        candidate.voteCount++;
        await candidate.save();

        //update user document
        user.isVoted=true;
        await user.save();

        res.status(200).json({msg:"vote recorded successfully"})

    }
    catch(err){
        res.status(500).json("internal server error")
    }

})

router.get('/vote/count',async (req,res)=>{
    console.log("hi")
    try{

        //find all candidate and sort then by vote count
        const candidate=await Candidate.find().sort({voteCount:'desc'});

        console.log("hik")

        //map candidate only to name and voteCount
        const voteRecord=candidate.map((data)=>{
            return{
                party:data.party,
                count:data.voteCount
            }
        });

        return res.status(200).json(voteRecord)
    }
    catch(err){
        res.status(500).json("internal server error")


    }
})
   

router.get('/',async (req,res)=>{
    try{
        const candidate=await Candidate.find({},'name party -_id');
        return res.status(200).json(candidate);
    }
    catch(err){
                res.status(500).json("internal server error")

    }
})

module.exports=router
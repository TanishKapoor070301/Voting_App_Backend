const mongoose=require('mongoose')
require('dotenv').config();

const mongoURL = process.env.MongoUrl;

mongoose.connect(mongoURL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

const db=mongoose.connection;

db.on('connected',()=>{
    console.log("connected to mongodb server");
})

db.on('error',()=>{
    console.log("error to mongodb server");
})

db.on('disconnected',()=>{
    console.log("disconnected to mongodb server");
})

module.exports=db;
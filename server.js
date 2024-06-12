const express=require('express');
const app=express();
require('dotenv').config();

const bodyparser=require('body-parser');
app.use(bodyparser.json());

const PORT=process.env.PORT||3000;

const db=require('./db')

const {jwtMiddleware}=require('./jwt')


const userRoute=require('./routes/userRoutes')
const candidateRoute=require('./routes/candidateRoutes')

app.use('/user' ,userRoute)


//candidate pr only admin can do 
app.use('/candidate',candidateRoute)

app.listen(PORT,()=>{
    console.log("listening on port 3000");
})


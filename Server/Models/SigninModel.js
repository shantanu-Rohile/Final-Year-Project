import mongoose from "mongoose";

const SigninSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },
     email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
})

const SigninModel=mongoose.model("Signin",SigninSchema);

export default SigninModel;
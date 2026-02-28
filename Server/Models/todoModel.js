import mongoose from "mongoose";

const todoSchema=new mongoose.Schema({
    task:{
        type:String,
        required:true
    },
    userId:{
        type:mongoose.Schema.ObjectId,
        ref:'Signin',
        required:true
    }
})

const todoModel=mongoose.model("todoList",todoSchema);
export default todoModel;
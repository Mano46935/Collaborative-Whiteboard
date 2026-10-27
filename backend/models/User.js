import mongoose from "mongoose";
const {Schema}=mongoose;
 const userData=new Schema(
    {
        username:{type:String,required:true, unique:true,trim:true},
        passwordHash:{type:String,required:true},
        email:{type:String,required:true,unique:true}
    }
);
export const User=mongoose.model("User",userData);
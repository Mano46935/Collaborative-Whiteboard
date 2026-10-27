import express from "express";
import {User} from "../models/User.js";
import bcrypt from "bcrypt";

const router=express.Router();
router.post("/check",async(req,res)=>{
try{
    const user=await User.findOne({username:req.body.username});
    const user1=await User.findOne({email:req.body.email});
    if(user || user1){
        return res.status(401).json({message:"Username or email already exists"});
    }
    return res.status(200).json({message:"User can register!"});
}
catch(e){
console.error(e);
return res.status(500).json({message:"Internal server error"});
}
});
router.post("/",async(req,res)=>{
try{
    const user=await User.findOne({username:req.body.username});
if(!user){
  return res.status(401).json({message:"Invalid username or password."});
}
const valid=await bcrypt.compare(req.body.password,user.passwordHash,);

if(!valid){
     return res.status(401).json({
                message: "Invalid username or password"
            });
        }
req.session.userId=user._id.toString();
req.session.save((err)=>{
if(err){
    console.error(err);
    return res.status(500).json({message:"Could not create session."});
}
return res.status(200).json({message:"Login successful"});
});
}catch(e){
    console.error(e);
    return res.status(500).json({message:"Internal server error."});

}
});

router.post("/Register",async(req,res)=>{
try{
    const passwordHashed=await bcrypt.hash(req.body.password,12);
const user=await User.create({username:req.body.username,passwordHash:passwordHashed,email:req.body.email});
if(!user){
    return res.status(500).json({message:"User is not created"});
}
return res.status(201).json({message:"User created"});
}
catch(e){
    console.error(e);
    return res.status(500).json({message:"Internal server error"});
}
});

router.post("/logout",async (req,res)=>{
req.session.destroy((err)=>{
if(err){
    return res.status(500).json({message:"Login Failed"});
}
res.clearCookie("whiteboard.sid");
return res.status(200).json({message:"User logged out."});

});
});
export default router;
import mongoose from "mongoose";
const connectDB=async()=>{
    try{
        const url=process.env.MONGO_URL || "mongodb://localhost:27017/whiteboard";
        await mongoose.connect(url);
     console.log("Connected to MongoDB");
    } catch(e){
        console.error("Connection error",e.message);
        process.exit(1);
    }
}
export default connectDB;
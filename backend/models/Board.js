import mongoose from "mongoose";
const {Schema}=mongoose;
const PointSchema=new Schema(
    {
        x:{type:Number,required:true},
        y:{type:Number,required:true}
    }, 
    {_id:false}

);
const StrokeSchema=new Schema(
{
    strokeId:{type:String,required:true},
    userId:{type:String,required:true},
    username:{type:String,default:"Guest"},
    tool:{type:String,enum:["pen","eraser"],default:"pen"},
    color:{type:String,default:"#1e1e1e"},
    width:{type:Number,default:5},
    points:{type:[PointSchema],default:[]},
},
  { _id: false, timestamps: true }
);
const BoardSchema=new Schema(
    {
        name:{type:String,default:"Untitled"},
        strokes:{type:[StrokeSchema],default:[]},
        visibility:{type:String,enum:["public","private"],default:"public",required:true},
        ownerId:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        },
        allowedUsers:[{type:Schema.Types.ObjectId,ref:"User"}],
    inviteCode:{type:String,unique:true,  sparse: true}
    }
    ,
    {timestamps:true}
);
const Board=mongoose.model("Board",BoardSchema);
export default Board;

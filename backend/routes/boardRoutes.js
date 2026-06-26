import express from "express";
import Board from "../models/Board.js"
const router=express.Router();

router.get("/",async (req,res)=>{
    try{
const boards= await Board.find({},{strokes:0}).sort({updatedAt:-1});
res.json(boards)
    } catch(e){
        res.status(500).json({message:e.message});
    }
});
router.post("/",async (req,res)=>{
    try{
    const boards= await Board.create({name:req.body.name||"Untitled"});
    res.status(200).json(boards);
    }catch(e){
        res.status(400).json({message:e.message});
    }
});
router.get("/:id",async (req,res)=>{
try{
    const board= await Board.findById(req.params.id);
    if(!board) return res.status(404).json({message:"Board not found"});
    res.json(board);

}catch(e){
    res.status(400).json({message:e.message});

}
});
router.delete("/:id",async (req,res)=>{
try{
    const board =await Board.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json({ message: "Board deleted" });
} catch(e){
    res.status(400).json({message:e.message});
}
});
export default router;
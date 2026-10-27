import express from "express";
import Board from "../models/Board.js"
const router=express.Router();
import requireAuth from "../middleware/requireAuth.js";
import crypto from "crypto";

function generateInviteCode() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}
router.get("/",requireAuth,async (req,res)=>{
    try{
const boards= await Board.find({},{strokes:0}).sort({updatedAt:-1});
res.json(boards)
    } catch(e){
        res.status(500).json({message:e.message});
    }
});
router.post("/",requireAuth,async (req,res)=>{
    try{
        const visibility=req.body.visibility;
        let inviteCode;
        if(visibility==="private"){
         inviteCode=generateInviteCode();}


    const boards= await Board.create({name:req.body.name||"Untitled",visibility:req.body.visibility,ownerId:req.session.userId,inviteCode:inviteCode});
    res.status(201).json({boards,inviteCode:inviteCode});
    }catch(e){
        res.status(400).json({message:e.message});
    }
});
router.get("/:id", requireAuth, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id);

        if (!board) {
            return res.status(404).json({
                message: "Board not found"
            });
        }

        const owner = board.ownerId &&
            board.ownerId.toString() === req.session.userId.toString();

        if (board.visibility === "private" && !owner) {
            const inviteCode = req.query.inviteCode;

            if (!inviteCode || inviteCode !== board.inviteCode) {
                return res.status(403).json({
                    message: "Invalid or incorrect invite code."
                });
            }
        }

        res.json(board);

    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});
router.delete("/:id",requireAuth,async (req,res)=>{
try{
    const board =await Board.findByIdAndDelete(req.params.id);
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json({ message: "Board deleted" });
} catch(e){
    res.status(400).json({message:e.message});
}
});
router.get("/:id/metadata", requireAuth, async (req, res) => {
    try {
        const board = await Board.findById(req.params.id).select("name visibility ownerId inviteCode allowedUsers");
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        const isOwner = board.ownerId.toString() === req.session.userId.toString();
        const isAllowed = board.allowedUsers?.some(u => u.toString() === req.session.userId.toString());
        res.json({
            _id: board._id,
            name: board.name,
            visibility: board.visibility,
            isOwner,
            isAllowed,
         
            inviteCode: (isOwner || isAllowed) ? board.inviteCode : null
        });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});
router.post("/:id/join", requireAuth, async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const board = await Board.findById(req.params.id);

        if (!board) return res.status(404).json({ message: "Board not found" });

        if (board.visibility === "public") {
            return res.json({ success: true });
        }

        const isOwner = board.ownerId.toString() === req.session.userId.toString();
        if (isOwner) {
            return res.json({ success: true });
        }

        if (!inviteCode || inviteCode.trim().toUpperCase() !== board.inviteCode) {
            return res.status(403).json({ message: "Invalid or incorrect invite code." });
        }

        if (!board.allowedUsers.includes(req.session.userId)) {
            board.allowedUsers.push(req.session.userId);
            await board.save();
        }

        return res.json({ success: true, inviteCode: board.inviteCode });
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
});



export default router;
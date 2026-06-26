import { v4 as uuidv4 } from "uuid";
import Board from "../models/Board.js";
const presence=new Map();
function getRoomUsers(boardId){
    let room=presence.get(boardId);
    if(!room)return [];
    return Array.from(room.values());
}
export default function registerWhiteBoardHandlers(io){
    io.on("connection",(socket)=>{
        let currentBoardId=null;
        socket.on("join-board",async ({boardId,userName,color})=>{
            try{
            currentBoardId=boardId;
            socket.join(boardId);
            if(!presence.has(boardId)) presence.set(boardId,new Map());
            presence.get(boardId).set(socket.id,{
                userId:socket.id,
                userName:userName||"Guest",
                color:color||"#1e88e5",
            });
           const board = await Board.findById(boardId);
        socket.emit("init-board", {
          strokes: board ? board.strokes : [],
          users: getRoomUsers(boardId),
        });
        io.to(boardId).emit("user-joined",{users:getRoomUsers(boardId)});

            }catch(e){
                socket.emit("board-error", { message: "Could not join board" });

            }
        });
            //Stroke started by the user.
            socket.on("stroke-start",({boardId,stroke})=>{
                socket.to(boardId).emit("stroke-start",stroke);
            });
         //Move point by point
            socket.on("stroke-point",({boardId,strokeId,point})=>{
                socket.to(boardId).emit("stroke-point",{strokeId,point});
            });
            //Stroke ends
             socket.on("stroke-end", async ({ boardId, stroke }) => {
      socket.to(boardId).emit("stroke-end", stroke);
      try {
        await Board.findByIdAndUpdate(boardId, {
          $push: { strokes: { ...stroke, strokeId: stroke.strokeId || uuidv4() } },
        });
        
      } catch (err) {
        console.error("[Socket] Failed to persist stroke:", err.message);
      }
    });
      //Cursor movement
        socket.on("cursor-move", ({ boardId, x, y }) => {
      socket.to(boardId).emit("cursor-move", { userId: socket.id, x, y });
    });
    //Undo Last Stroke
     socket.on("undo-last",async ({boardId,})=>{
try{
    const board=await Board.findById(boardId);
    if(!board)return;
    const idx=[...board.strokes].reverse().findIndex((s)=>s.userId===socket.id);
    if(idx===-1)return;
    const realidx=board.strokes.length-1-idx;
    const [removed]=board.strokes.splice(realidx,1);
    await board.save();
    io.to(boardId).emit("stroke-removed",{strokeId:removed.strokeId});
}
catch(err){
       console.error("[Socket] Failed to undo stroke:", err.message);

}
     });
     //Clear Board
socket.on("clear-board", async ({ boardId }) => {
      try {
        await Board.findByIdAndUpdate(boardId, { $set: { strokes: [] } });
        io.to(boardId).emit("board-cleared");
      } catch (err) {
        console.error("[Socket] Failed to clear board:", err.message);
      }
    });

    // Disconnect user
    socket.on("disconnect", () => {
      if (!currentBoardId) return;
      const room = presence.get(currentBoardId);
      if (room) {
        room.delete(socket.id);
        if (room.size === 0) presence.delete(currentBoardId);
      }
      io.to(currentBoardId).emit("user-left", { users: getRoomUsers(currentBoardId) });
    });

        });
  
}
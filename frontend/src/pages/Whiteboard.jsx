import {useEffect,useRef,useState,useCallback}from "react";
import {useNavigate,useParams} from "react-router-dom";
import Canvas from "../components/Canvas.jsx";
import Toolbar from "../components/Toolbar.jsx";
import UserList from "../components/UserList.jsx";
import {socket} from "../services/socket.js";
import { api } from "../services/api.js";
const CURSOR_COLORS = ["#e53935", "#1e88e5", "#43a047", "#fb8c00", "#8e24aa", "#00897b"];
const randomColor = () => CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
export default function Whiteboard(){
  const {boardId}=useParams();
  const navigate=useNavigate();
  const [joined,setJoined]=useState(false);
  const [userName,setUserName]=useState("");
  const [myColor,setMyColor]=useState(randomColor)
  const [boardName,setBoardName]=useState("Board");
  const [strokes,setStrokes]=useState([]);
  const [liveStrokes,setLiveStrokes]=useState({});
  const [users,setUsers]=useState([]);
  const [cursors,setCursors]=useState({});
  const [selfId,setSelfId]=useState(null);
  const [error,setError]=useState("");
  const [tool,setTool]=useState("pen");
  const [color,setColor]=useState("#1e1e1e");
  const [width,setWidth]=useState(4);
  const[inviteCode,setInviteCode]=useState("");
  const[visibility,setVisibility]=useState("public");
  const [isOwner, setIsOwner] = useState(false);
const [isAllowed, setIsAllowed] = useState(false);
  const lastCursorEmit=useRef(0);//Last instance when cursor pos was sent.
  //Load boards metadata
  
  useEffect(()=>{
    const onConnect=()=>setSelfId(socket.id);
    const onInitBoard=({strokes:initialStrokes,users:initialUsers})=>{
      setStrokes(initialStrokes||[]);
      setUsers(initialUsers||[]);
    }
    const onUserJoined=({users:u})=>setUsers(u);
    const onUserLeft=({users:u})=>setUsers(u);
    const onStrokeStart=(stroke)=>{
      setLiveStrokes((prev)=>({...prev,[stroke.strokeId]:stroke}));
    };
    const onStrokePoint=({strokeId,point})=>{
      setLiveStrokes((prev)=>{
        const existing=prev[strokeId];
        if(!existing)return prev;
        existing.points.push(point);
        return {...prev};
      });
    };
    const onStrokeEnd=(stroke)=>{
      setStrokes((prev)=>[...prev,stroke]);
      setLiveStrokes((prev)=>{
        const copy={...prev};
        delete copy[stroke.strokeId];//Only delete the current user's stroke end.
        return copy;
      });
    };
    const onCursorMove=({userId,x,y})=>{
      setCursors((prev)=>({...prev,[userId]:{x,y}}));
    };
    const onBoardCleared=()=>{
      setStrokes([]);
      setLiveStrokes([]);
    }
    const onStrokeRemoved=({strokeId})=>{
      setStrokes((prev)=>prev.filter((s)=>s.strokeId!==strokeId));
    };
    const onBoardError=({message})=>setError(message);
   socket.on("connect", onConnect);
    socket.on("init-board", onInitBoard);
    socket.on("user-joined", onUserJoined);
    socket.on("user-left", onUserLeft);
    socket.on("stroke-start", onStrokeStart);
    socket.on("stroke-point", onStrokePoint);
    socket.on("stroke-end", onStrokeEnd);
    socket.on("cursor-move", onCursorMove);
    socket.on("board-cleared", onBoardCleared);
    socket.on("stroke-removed", onStrokeRemoved);
    socket.on("board-error", onBoardError);
     return () => {
      socket.off("connect", onConnect);
      socket.off("init-board", onInitBoard);
      socket.off("user-joined", onUserJoined);
      socket.off("user-left", onUserLeft);
      socket.off("stroke-start", onStrokeStart);
      socket.off("stroke-point", onStrokePoint);
      socket.off("stroke-end", onStrokeEnd);
      socket.off("cursor-move", onCursorMove);
      socket.off("board-cleared", onBoardCleared);
      socket.off("stroke-removed", onStrokeRemoved);
      socket.off("board-error", onBoardError);
      socket.disconnect();
     };

  },[boardId]);
 const handleJoin = async (e) => {
    e.preventDefault();
    setError("");

    try {
        // Verify invite code
        if (visibility === "private" && !isOwner && !isAllowed) {
            const res = await api.joinBoard(boardId, inviteCode.trim());
            if (res.inviteCode) setInviteCode(res.inviteCode);
            setIsAllowed(true);
        }

        const name = userName.trim() || "Guest";
        setUserName(name);

        socket.connect();
        socket.once("connect", () => {
            socket.emit("join-board", { boardId, userName: name, color: myColor });
        });

        setJoined(true);
    } catch (err) {
        setError(err.message);
    }
};
  //---Canvas callbacks---
  const handleLocalStrokeStart=useCallback(
    (stroke)=>{
      stroke.userId=socket.id;
      stroke.userName=userName;
      setLiveStrokes((prev)=>({...prev,[stroke.strokeId]:stroke}));
      socket.emit("stroke-start",{boardId,stroke});
    },[boardId,userName]
  );
  const handleLocalStrokePoint=useCallback(
    (strokeId,point)=>{
      socket.emit("stroke-point",{boardId,strokeId,point});
    },[boardId]
  );
   const handleLocalStrokeEnd = useCallback(
    (stroke) => {
      setStrokes((prev) => [...prev, stroke]);
      setLiveStrokes((prev) => {
        const copy = { ...prev };
        delete copy[stroke.strokeId];
        return copy;
      });
      socket.emit("stroke-end", { boardId, stroke });
    },
    [boardId]
  );

  const handleCursorMove = useCallback(
    (x, y) => {
      const now = Date.now();
      if (now - lastCursorEmit.current < 40) return; 
      lastCursorEmit.current = now;
      socket.emit("cursor-move", { boardId, x, y });
    },
    [boardId]
  );
const handleClear = () => {
    if (window.confirm("Clear the whole board for everyone?")) {
      socket.emit("clear-board", { boardId });
    }
  };

  const handleUndo = () => socket.emit("undo-last", { boardId });

  const handleLeave = () => navigate("/Home");
useEffect(() => {
    api.getBoardMetadata(boardId)
        .then((meta) => {
            setBoardName(meta.name);
            setVisibility(meta.visibility);
            setIsOwner(meta.isOwner);
            setIsAllowed(meta.isAllowed);
            if (meta.inviteCode) {
                setInviteCode(meta.inviteCode);
            }
        })
        .catch((err) => setError(err.message));
}, [boardId]);
  if (!joined) {
    
    return (
      <div className="join-screen">
        <form className="join-card" onSubmit={handleJoin}>
          
          <h2>Join "{boardName}"</h2>
          {visibility==="private" && !isOwner && !isAllowed &&(
            <input placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e)=>setInviteCode(e.target.value)}
            required />
          )}
          <p className="muted">Pick a display name so others can see who's drawing.</p>
          <input
            autoFocus
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
          <button type="submit">Join board</button>
          {error && <p className="error-text">{error}</p>}
        </form>
      </div>
    );
  }
    const remoteUsersForCursors = users.filter((u) => u.userId !== selfId);

  return (
    <div className="whiteboard-page">
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        width={width}
        setWidth={setWidth}
        onClear={handleClear}
        onUndo={handleUndo}
        onLeave={handleLeave}
        boardName={boardName}
      />
        {visibility === "private" && inviteCode && (
            <div id="inviteCodebar">
                <span> Invite Code: {inviteCode}</span>
                <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(inviteCode)}
                    style={{ padding: "2px 8px", cursor: "pointer" }}
                >
                    Copy Code
                </button>
            </div>
        )}
      <div className="board-area">
        <Canvas
          strokes={strokes}
          liveStrokes={liveStrokes}
          tool={tool}
          color={color}
          width={width}
          onLocalStrokeStart={handleLocalStrokeStart}
          onLocalStrokePoint={handleLocalStrokePoint}
          onLocalStrokeEnd={handleLocalStrokeEnd}
          onCursorMove={handleCursorMove}
        />
        {remoteUsersForCursors.map((u) => {
          const pos = cursors[u.userId];
          if (!pos) return null;
          return (
            <div
              key={u.userId}
              className="remote-cursor"
              style={{ left: pos.x, top: pos.y, color: u.color }}
            >
              <span className="cursor-dot" style={{ backgroundColor: u.color }} />
              <span className="cursor-label" style={{ backgroundColor: u.color }}>
                {u.userName}
              </span>
            </div>
          );
        })}
        <div className="floating-userlist">
          <UserList users={users} selfId={selfId} />
        </div>
      </div>
      {error && <p className="error-banner">{error}</p>}
    </div>
  );
}
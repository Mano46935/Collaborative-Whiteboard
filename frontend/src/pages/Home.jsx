import {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
export default function Home(){
    const [boards,setBoards]=useState([]);
    const [name,setName]=useState("");
    const [error,setError]=useState("");
    const [loading,setLoading]=useState(true);
    const navigate=useNavigate();
    const loadBoards=()=>{
        setLoading(true);
        api.listBoards().then(setBoards)
        .catch((err)=>setError(err.message))
        .finally(()=>setLoading(false));
    };
    useEffect(()=>{
        loadBoards();
    },[]);
    const handleCreate=async(e)=>{
        e.preventDefault();
        try{
            const board=await api.createBoard(name.trim()||"Untitled");
            navigate(`/boards/${board._id}`);

        }catch(err){
            setError(err.message);
        }
    };
    const handleDelete=async (id)=>{
        try{
            await api.deleteBoard(id);
            setBoards((prev)=>prev.filter((b)=>b._id!==id));

        }catch(err){
            setError(err.message);
        }

    };
    return(
<div className="home">
    <header className="home-header">
        <h1>Collaborative Whiteboard</h1>
        <p>Pick/Create a board to get started.</p>
    </header>
    <form className="create-form" onSubmit={handleCreate}>
        <input type="text" placeholder="Board name(Optional)" value={name} onChange={(e)=>setName(e.target.value)}/>
        <button type="submit">+ New board</button>
    </form>
    {error && <p className="error-text">{error}</p>}
    {loading?(<p className="muted">Loading boards...</p>)
    : boards.length===0?(
        <p className="muted">No boards yet. Create a new one to get started.</p>
    ):(
        <ul className="board-list">
            {boards.map((b)=>(
                <li key={b._id} className="board-item">
                    <button className="board-link" onClick={()=>navigate(`/boards/${b._id}`)}>
                        <span className="board-name">{b.name}</span>
                        <span className="board-meta">Updated {new Date(b.updatedAt).toLocaleString()}</span>
                    </button>
                    <button className="icon-btn" title="Delete Board" onClick={()=>handleDelete(b._id)}>
                           ✕
                    </button>
                </li>
            ))}
        </ul>
    )
    }

</div>
    );
}
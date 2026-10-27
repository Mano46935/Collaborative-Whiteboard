import {useState,useEffect} from "react";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";     
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
export default function Login(){
    const navigate=useNavigate();
    const [username,setUsername]=useState("");
    const [password,setPassword]=useState("");
    const[error,setError]=useState("");
    const handleSubmit=async(e)=>{
        e.preventDefault();
        
       try {
    await api.login(username, password);
    navigate("/home");
} catch (e) {
    setError(e.message);
}
      
    }
    return(
        <div id="loginpage">
        <div id="login_title">Login Credentials.</div>
        <form onSubmit={handleSubmit} >
        <div id="username">
            <label htmlFor="usernametype">
                <input id="usernametype" type="text" placeholder="Enter your username..." value={username} onChange={(e)=>setUsername(e.target.value)} required/>
            </label>
            
        </div>
        <div id="password">
        <label htmlFor="passwordtype">
            <input id="passwordtype" type="password" placeholder="Enter your password..." value={password} onChange={(e)=>setPassword(e.target.value)}required/>
        </label>
        </div>
        <button type="submit" id="loginbutton">Submit</button>
        </form>
       <Link to="/Register" id="Registrationlink">
    Don't have an account? Register here
</Link>
        </div>
    )
}
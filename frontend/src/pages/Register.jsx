import {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
export default function Register(){
    const navigate=useNavigate();
    const [username,setUsername]=useState("");
    const[password,setPassword]=useState("");
    const[email,setEmail]=useState("");
    const[error,setError]=useState("");
    const handleSubmit=async(e)=>{
          e.preventDefault();
       try {
    await api.checkAvailability(username, email);
    await api.register(username, email, password);
    navigate("/");
} catch (e) {
    setError(e.message);
}
    }
    

    
    return(
        <div id="registerdiv">
            <h3>Registration Form.</h3>
        <form onSubmit={handleSubmit}>
            <div>
        <label htmlFor="registername"> Username :
        <input id="registername" value={username} type="text" placeholder="Enter the username..." onChange={(e)=>setUsername(e.target.value)} required/>
        </label>
        </div>
        <div>
        <label htmlFor="registerpassword"> Password :
        <input id="registerpassword" value={password} type="password" placeholder="Enter the password..." onChange={(e)=>setPassword(e.target.value)} required/>
        
        </label>
        </div>
        <div>
        <label htmlFor="registeremail"> Email :
        <input id="registeremail" value={email} type="email" placeholder="Enter your email... " onChange={(e)=>setEmail(e.target.value)} required/>
        </label>
        </div>
        <button type="submit" id="registerbtn">Register</button>
        </form>
        
        </div>
    )
}
import {Routes,Route}from "react-router-dom";
import Home from "./pages/Home.jsx";
import Whiteboard from "./pages/Whiteboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
export default function App(){
    return(
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/Home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
            <Route path="/boards/:boardId" element={<ProtectedRoute><Whiteboard/></ProtectedRoute>}/>
            <Route path="/Register" element={<Register/>}/>
        </Routes>
    );
}
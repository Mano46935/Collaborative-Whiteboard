import { useNavigate, Link } from "react-router-dom";
import { SERVER_URL } from "../services/api.js";
export default function Navbar() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch(
                `${SERVER_URL}/api/login/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

            if (!response.ok) {
                console.error("Could not log out.");
                return;
            }

            navigate("/");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <nav id="navbardiv">
            <div id="navbar">
                <Link to="/Home" id="boardsNav">
                    Boards
                </Link>

                <button
                    type="button"
                    id="logoutbtn"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
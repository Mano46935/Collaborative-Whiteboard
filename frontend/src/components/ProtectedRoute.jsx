import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function ProtectedRoute({ children }) {
    const [authenticated, setAuthenticated] = useState(null);

    useEffect(() => {
        api.getMe()
            .then(() => setAuthenticated(true))
            .catch(() => setAuthenticated(false));
    }, []);

    if (authenticated === null) return <p>Checking login...</p>;
    if (!authenticated) return <Navigate to="/" replace />;
    return children;
}
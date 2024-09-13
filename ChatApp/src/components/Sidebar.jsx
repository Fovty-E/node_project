import { Link } from "react-router-dom";
import { AuthContext } from "../utils/contexts/AuthProvider";
export function Sidebar() {
    return (
    <div className="sidebar">
        <h4 className="text-center">Dashboard</h4>
        <Link to="/dashboard">Home</Link>
        <Link to="/chat">Chat</Link>
        <Link to="#settings">Settings</Link>
        <Link to="/logout" id="logout">Logout</Link>
    </div>
    )
}
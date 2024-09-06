import { Link } from "react-router-dom";

export function Sidebar() {
    return (
    <div class="sidebar">
        <h4 className="text-center">Dashboard</h4>
        <Link to="/dashboard">Home</Link>
        <Link to="/dashboard/chat">Chat</Link>
        <Link to="#settings">Settings</Link>
        <Link to="/logout" id="logout">Logout</Link>
    </div>
    )
}
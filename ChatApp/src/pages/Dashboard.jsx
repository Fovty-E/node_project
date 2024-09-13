import { useState, useEffect } from "react";
import { Link } from "react-router-dom"
import { io } from 'socket.io-client';
import { Sidebar } from "../components/Sidebar";
import useAxios  from "../utils/axiosInstance";


export function Dashboard() {
    const axiosInstance = useAxios();
    const [UserDetails, setUserDetails] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(()=> {
        axiosInstance.get('/user')
        .then(response => {
            setLoading(false)
            setUserDetails(response.data)
        })
        .catch(error => console.log(error.message))
    }, [])
   
    return (
        <>
        {
        loading ? <div>Loading...</div> :
        <>
        <Sidebar />

        <div className="content">
            <div className="container">
                <h1>Welcome to Your Dashboard</h1>
                <p>This is a basic dashboard layout. Here you can display user-specific information and control panels.</p>

                <div className="card mb-4">
                    <div className="card-header">
                        <h5>User Information</h5>
                    </div>
                    <div className="card-body">
                        <p><strong>Name:</strong> <span id="name">{UserDetails.firstname} {UserDetails.lastname}</span></p>
                        <p><strong>Username:</strong> <span id="username">{UserDetails.username}</span></p>
                        <p><strong>Email:</strong> <span id="email">{UserDetails.email}</span></p>
                        {/* <p><strong>Role:</strong> Admin</p> */}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h5>Recent Activities</h5>
                    </div>
                    <div className="card-body">
                        <ul>
                            <li>User logged in</li>
                            <li>User updated profile</li>
                            <li>User sent a message</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        </>
        }
            
        </>
    )
}
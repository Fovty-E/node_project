import {  useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios'
import Notiflix from 'notiflix';

export function RegisterUser(){

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [formError, setFormError] = useState({ error: false, errMsg: 'An error occured' })
        useDocTitle('Chat app | User registration')
    useEffect(()=>{
        setFormError(f => ({...f, error: false}))
    }, [formData])

    const navigate = useNavigate()
    const {error, errMsg} = formError;
    const handleUserRegistration = async (e) => {
        e.preventDefault()
       
        console.log(formData)
        try {
            const response = await axios.post('/api/register', formData)
             console.log(response)
             if(response){
                setFormData({
                    firstname: '',
                    lastname: '',
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                })
                Notiflix.Report.success(
                    'Success',
                    response.data.message,
                    'Okay',
                );
                navigate('/login')
             }
        } catch (err) {
            const {message} = err.response.data
            setFormError({ error: true, errMsg: message })
            console.log(message)
        }
    }    

    return (
        <div className="container mt-5">
        <h2 className="text-center">User Registration</h2>
        <div id="status-message" className="alert d-none"></div>
        <form id="register-form" onSubmit={(e) => {
            handleUserRegistration(e)
        }}>
            { error && <div className='alert alert-danger' >{errMsg}</div>} 
            <div className="form-group">
                <label htmlFor="firstname">First name</label>
                <input type="text" className="form-control" onChange={(e) =>{ setFormData((f) => ({ ...f, firstname: e.target.value })) }} value={formData.firstname} id="firstname" name="firstname" placeholder="Enter firstname" required />
            </div>
            <div className="form-group">
                <label htmlFor="lastname">Last name</label>
                <input type="text" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, lastname: e.target.value })) }} value={formData.lastname} id="lastname" name="lastname" placeholder="Enter lastname" required />
            </div>
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, username: e.target.value })) }} value={formData.username} id="username" name="username" placeholder="Enter username" required />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input type="email" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, email: e.target.value })) }} value={formData.email} id="email" name="email" placeholder="Enter email" required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, password: e.target.value })) }} value={formData.password} id="password" name="password" placeholder="Password" required />
            </div>
            <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input type="password" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, confirmPassword: e.target.value })) }} value={formData.confirmPassword} id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required />
            </div>
            <button type="submit" className="btn btn-primary btn-block">Register</button>
        </form>
    </div>
    );
}
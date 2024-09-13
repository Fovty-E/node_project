import {  useState, useEffect, useContext } from 'react'
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../utils/contexts/AuthProvider';
import {useDocTitle} from '../components/CustomHook';
import axios from 'axios'
import Notiflix from 'notiflix';

export function LoginUser(){
    const { login } = useContext(AuthContext)
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [formError, setFormError] = useState({ error: false, errMsg: 'An error occured' })
        useDocTitle('Chat app | User Login')
    useEffect(()=>{
        setFormError(f => ({...f, error: false}))
    }, [formData])

    const navigate = useNavigate()
    const {error, errMsg} = formError;
    function resendVerification (userId){
        axios.post('/api/register/resendVerification', {userId})
        .then(response => {
            if(response.data.success){
                Notiflix.Report.success(
                    'Email sent',
                    'An email verification mail has been sent to you, kindly verify your email to access your account',
                    'Okay',
                );
                
            }
            
        })
        .catch(err => console.log(err))
    }
    const handleUserLogin = async (e) => {
        e.preventDefault()
       
            const result = await login(formData)
             console.log(result)
             if(result.success){
                setFormData({
                    username: '',
                    password: '',
                })
                navigate('/dashboard', {state: result.UserDetails} )
             }else {
                const {notVerified, message, userId} = result.error;
                if (notVerified) {
                    setFormError({ error: true, errMsg: <><p>Account not verified, check your email for a verification mail from us or <a href="#" onClick={() => resendVerification(userId)}>click Here</a></p></> })
                }else{
                    setFormError({ error: true, errMsg: message ?? 'An error occured' })
                }
             }
       
    }    

    return (
        <div className="container mt-5">
        <h2 className="text-center">User Login</h2>
        <div id="status-message" className="alert d-none"></div>
        <form id="register-form" onSubmit={(e) => {
            handleUserLogin(e)
        }}>
            { error && <div className='alert alert-danger' >{errMsg}</div>} 
            
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, username: e.target.value })) }} value={formData.username} id="username" name="username" placeholder="Enter username" required />
            </div>
            
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" onChange={(e) =>{ setFormData(f => ({ ...f, password: e.target.value })) }} value={formData.password} id="password" name="password" placeholder="Password" required />
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">Login</button>
        </form>
    </div>
    );
}
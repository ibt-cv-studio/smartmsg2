import React,{useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {register} from '../services/api';
import {useAuth} from '../context/AuthContext';
export default function Register(){
  const[form,setForm]=useState({last_name:'',phone:'',password:'',confirm:''});
  const[error,setError]=useState('');const[loading,setLoading]=useState(false);
  const{signIn}=useAuth();const navigate=useNavigate();
  async function handleSubmit(e){e.preventDefault();setError('');
    if(form.password!==form.confirm){setError('Passwords do not match.');return;}
    setLoading(true);
    try{const{data}=await register({last_name:form.last_name,phone:form.phone,password:form.password});
      signIn(data.token,data.user);navigate('/');}
    catch(err){setError(err.response?.data?.error||'Registration failed.');}
    finally{setLoading(false);}
  }
  return(<div className="auth-page"><div className="auth-box">
    <h1>SmartMsg</h1><p className="subtitle">Create your free account</p>
    {error&&<div className="alert alert-error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Last name</label>
        <input type="text" placeholder="Your last name" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})} required/></div>
      <div className="form-group"><label>Phone number</label>
        <input type="tel" placeholder="+250 788 000 000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/>
        <p className="form-hint">This is your login ID — use your real phone number.</p></div>
      <div className="form-group"><label>Password</label>
        <input type="password" placeholder="Min 4 characters" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
      <div className="form-group"><label>Confirm password</label>
        <input type="password" placeholder="Repeat your password" value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})} required/></div>
      <button className="btn btn-primary btn-full" disabled={loading}>{loading?'Creating...':'Create account'}</button>
    </form>
    <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'#888'}}>Already have an account?{' '}
      <Link to="/login" style={{color:'#4f8ef7',textDecoration:'none',fontWeight:500}}>Sign in</Link></p>
  </div></div>);
}

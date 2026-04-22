import React,{useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {login} from '../services/api';
import {useAuth} from '../context/AuthContext';
export default function Login(){
  const[form,setForm]=useState({phone:'',password:''});
  const[error,setError]=useState('');
  const[loading,setLoading]=useState(false);
  const{signIn}=useAuth();const navigate=useNavigate();
  async function handleSubmit(e){e.preventDefault();setError('');setLoading(true);
    try{const{data}=await login(form);signIn(data.token,data.user);navigate('/');}
    catch(err){setError(err.response?.data?.error||'Login failed.');}
    finally{setLoading(false);}
  }
  return(<div className="auth-page"><div className="auth-box">
    <h1>SmartMsg</h1><p className="subtitle">Sign in to your account</p>
    {error&&<div className="alert alert-error">{error}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Phone number</label>
        <input type="tel" placeholder="+250 788 000 000" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} required/></div>
      <div className="form-group"><label>Password</label>
        <input type="password" placeholder="Your password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>
      <button className="btn btn-primary btn-full" disabled={loading}>{loading?'Signing in...':'Sign in'}</button>
    </form>
    <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'#888'}}>No account?{' '}
      <Link to="/register" style={{color:'#4f8ef7',textDecoration:'none',fontWeight:500}}>Register here</Link></p>
  </div></div>);
}

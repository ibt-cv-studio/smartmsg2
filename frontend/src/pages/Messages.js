import React,{useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {getMessages,deleteMessage,updateMessage} from '../services/api';
import {categoryMeta} from '../components/CategoryMeta';
export default function Messages(){
  const location=useLocation();
  const[messages,setMessages]=useState([]);const[loading,setLoading]=useState(true);
  const[success,setSuccess]=useState(location.state?.success||'');const[filter,setFilter]=useState('all');
  useEffect(()=>{load();},[]);
  async function load(){setLoading(true);try{const{data}=await getMessages();setMessages(data);}finally{setLoading(false);}}
  async function handleDelete(id){if(!window.confirm('Delete this message?'))return;await deleteMessage(id);setMessages(m=>m.filter(x=>x.id!==id));}
  async function toggleActive(msg){const updated=await updateMessage(msg.id,{is_active:!msg.is_active});setMessages(m=>m.map(x=>x.id===msg.id?updated.data:x));}
  const filtered=messages.filter(m=>{if(filter==='active')return m.is_active;if(filter==='inactive')return!m.is_active;return true;});
  return(<div>
    <div className="page-header">
      <div><h2>Scheduled messages</h2><p>{messages.length} message{messages.length!==1?'s':''} total</p></div>
      <Link to="/compose" className="btn btn-primary">+ New message</Link>
    </div>
    {success&&<div className="alert alert-success" style={{marginBottom:20}}>{success}</div>}
    <div style={{display:'flex',gap:8,marginBottom:20}}>
      {['all','active','inactive'].map(f=>(
        <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 16px',borderRadius:20,border:'none',cursor:'pointer',
          background:filter===f?'#4f8ef7':'#e8edf2',color:filter===f?'#fff':'#555',fontSize:13,fontWeight:500,textTransform:'capitalize'}}>{f}</button>))}
    </div>
    {loading&&<p style={{color:'#aaa',fontSize:14}}>Loading...</p>}
    {!loading&&filtered.length===0&&(<div className="empty"><div className="icon">📭</div><p>No messages here yet.</p>
      <Link to="/compose" className="btn btn-primary" style={{marginTop:16,display:'inline-flex'}}>Schedule your first message</Link></div>)}
    <div className="msg-list">{filtered.map(msg=>{const meta=categoryMeta[msg.category]||categoryMeta['Other'];return(
      <div className="msg-card" key={msg.id} style={{opacity:msg.is_active?1:0.55}}>
        <div className="msg-icon" style={{background:meta.bg}}>{meta.icon}</div>
        <div className="msg-body">
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h4>{msg.category}</h4>
            <span className={`badge badge-${meta.color}`}>{msg.repeat_type}</span>
            {!msg.is_active&&<span className="badge badge-gray">paused</span>}
          </div>
          <div className="receiver">To: {msg.receiver_name?`${msg.receiver_name} (${msg.receiver_phone})`:msg.receiver_phone}</div>
          <div className="preview">"{msg.message_text}"</div>
          <div className="schedule"><span>📅 {msg.send_date}</span><span>🕐 {msg.send_time?.slice(0,5)}</span>
            {msg.times_sent>0&&<span style={{color:'#38a169'}}>✓ Sent {msg.times_sent}x</span>}</div>
        </div>
        <div className="msg-actions" style={{flexDirection:'column',gap:6}}>
          <Link to={`/edit/${msg.id}`} className="btn btn-ghost" style={{padding:'6px 12px',fontSize:13}}>Edit</Link>
          <button className="btn btn-ghost" style={{padding:'6px 12px',fontSize:13}} onClick={()=>toggleActive(msg)}>{msg.is_active?'Pause':'Resume'}</button>
          <button className="btn btn-danger" style={{padding:'6px 12px',fontSize:13}} onClick={()=>handleDelete(msg.id)}>Delete</button>
        </div>
      </div>);})}
    </div>
  </div>);
}

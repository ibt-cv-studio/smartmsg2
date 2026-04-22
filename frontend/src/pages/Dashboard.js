import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {getMessages,getStats} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {categoryMeta} from '../components/CategoryMeta';
export default function Dashboard(){
  const{user}=useAuth();
  const[messages,setMessages]=useState([]);
  const[stats,setStats]=useState({total:0,active:0,sent_month:0});
  const[loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([getMessages(),getStats()]).then(([m,s])=>{setMessages(m.data);setStats(s.data);}).finally(()=>setLoading(false));},[]);
  const upcoming=messages.filter(m=>m.is_active).slice(0,5);
  return(<div>
    <div className="page-header">
      <div><h2>Welcome back, {user?.last_name}</h2><p>Here is what is scheduled for your contacts</p></div>
      <Link to="/compose" className="btn btn-primary">+ New message</Link>
    </div>
    <div className="stats-row">
      <div className="stat-card"><div className="val">{stats.total}</div><div className="lbl">Total messages</div></div>
      <div className="stat-card"><div className="val">{stats.active}</div><div className="lbl">Active schedules</div></div>
      <div className="stat-card"><div className="val">{stats.sent_month}</div><div className="lbl">Sent this month</div></div>
    </div>
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h3 style={{fontSize:16,fontWeight:600}}>Upcoming messages</h3>
        <Link to="/messages" style={{fontSize:13,color:'#4f8ef7',textDecoration:'none'}}>View all</Link>
      </div>
      {loading&&<p style={{color:'#aaa',fontSize:14}}>Loading...</p>}
      {!loading&&upcoming.length===0&&(<div className="empty"><div className="icon">📭</div><p>No messages scheduled yet.</p>
        <Link to="/compose" className="btn btn-primary" style={{marginTop:16,display:'inline-flex'}}>Schedule your first message</Link></div>)}
      <div className="msg-list">{upcoming.map(msg=>{const meta=categoryMeta[msg.category]||categoryMeta['Other'];return(
        <div className="msg-card" key={msg.id}>
          <div className="msg-icon" style={{background:meta.bg}}>{meta.icon}</div>
          <div className="msg-body">
            <h4>{msg.category}</h4>
            <div className="receiver">To: {msg.receiver_name||msg.receiver_phone}</div>
            <div className="preview">"{msg.message_text}"</div>
            <div className="schedule"><span>📅 {msg.send_date}</span><span>🕐 {msg.send_time}</span>
              <span className={`badge badge-${meta.color}`}>{msg.repeat_type}</span></div>
          </div>
          <div className="msg-actions"><Link to={`/edit/${msg.id}`} className="btn btn-ghost" style={{padding:'6px 12px',fontSize:13}}>Edit</Link></div>
        </div>);})}</div>
    </div>
  </div>);
}

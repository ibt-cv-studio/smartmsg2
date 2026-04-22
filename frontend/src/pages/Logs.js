import React,{useEffect,useState} from 'react';
import {getLogs} from '../services/api';
import {categoryMeta} from '../components/CategoryMeta';
export default function Logs(){
  const[logs,setLogs]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{getLogs().then(({data})=>setLogs(data)).finally(()=>setLoading(false));},[]);
  return(<div>
    <div className="page-header"><div><h2>Send history</h2><p>All messages that were sent or failed</p></div></div>
    {loading&&<p style={{color:'#aaa',fontSize:14}}>Loading...</p>}
    {!loading&&logs.length===0&&(<div className="empty"><div className="icon">📋</div><p>No messages sent yet.</p></div>)}
    <div className="msg-list">{logs.map(log=>{const meta=categoryMeta[log.category]||categoryMeta['Other'];return(
      <div className="msg-card" key={log.id}>
        <div className="msg-icon" style={{background:meta.bg}}>{meta.icon}</div>
        <div className="msg-body">
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <h4>{log.category}</h4>
            <span className={`badge ${log.status==='sent'?'badge-green':'badge-red'}`}>{log.status==='sent'?'✓ Sent':'✗ Failed'}</span>
          </div>
          <div className="receiver">To: {log.receiver_name?`${log.receiver_name} (${log.receiver_phone})`:log.receiver_phone}</div>
          <div className="preview">"{log.message_text}"</div>
          {log.error_msg&&<div style={{fontSize:12,color:'#e53e3e',marginTop:4}}>Error: {log.error_msg}</div>}
          <div className="schedule"><span>🕐 {new Date(log.sent_at).toLocaleString()}</span></div>
        </div>
      </div>);})}
    </div>
  </div>);
}

import React,{useEffect,useState} from 'react';
import {useParams,useNavigate} from 'react-router-dom';
import {getMessage,updateMessage,deleteMessage} from '../services/api';
import {categoryMeta} from '../components/CategoryMeta';
export default function EditMessage(){
  const{id}=useParams();const navigate=useNavigate();
  const[form,setForm]=useState(null);const[error,setError]=useState('');const[loading,setLoading]=useState(false);
  useEffect(()=>{getMessage(id).then(({data})=>{setForm({category:data.category,receiver_name:data.receiver_name||'',
    receiver_phone:data.receiver_phone,message_text:data.message_text,
    send_date:data.send_date?.split('T')[0]||data.send_date,send_time:data.send_time?.slice(0,5),
    repeat_type:data.repeat_type,is_active:data.is_active});}).catch(()=>navigate('/messages'));},[id,navigate]);
  function set(f,v){setForm(p=>({...p,[f]:v}));}
  async function handleSave(e){e.preventDefault();setError('');setLoading(true);
    try{await updateMessage(id,form);navigate('/messages',{state:{success:'Message updated!'}});}
    catch(err){setError(err.response?.data?.error||'Update failed.');}finally{setLoading(false);}
  }
  async function handleDelete(){if(!window.confirm('Delete this message permanently?'))return;await deleteMessage(id);navigate('/messages');}
  if(!form)return<p style={{color:'#aaa',padding:32}}>Loading...</p>;
  const meta=categoryMeta[form.category]||categoryMeta['Other'];
  return(<div>
    <div className="page-header"><div><h2>Edit message</h2><p>Update the scheduled message details</p></div>
      <button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
    <div className="card">
      {error&&<div className="alert alert-error">{error}</div>}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <div style={{width:44,height:44,borderRadius:10,background:meta.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{meta.icon}</div>
        <div><h3 style={{fontSize:16}}>{form.category}</h3><p style={{fontSize:13,color:'#888'}}>{form.is_active?'🟢 Active':'⏸ Paused'}</p></div>
        <div style={{marginLeft:'auto'}}>
          <label style={{display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer'}}>
            <input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)}/> Active</label></div>
      </div>
      <form onSubmit={handleSave}>
        <div className="form-row">
          <div className="form-group"><label>Receiver name (optional)</label>
            <input type="text" value={form.receiver_name} onChange={e=>set('receiver_name',e.target.value)}/></div>
          <div className="form-group"><label>Receiver phone *</label>
            <input type="tel" value={form.receiver_phone} onChange={e=>set('receiver_phone',e.target.value)} required/></div>
        </div>
        <div className="form-group"><label>Message *</label>
          <textarea rows={4} value={form.message_text} onChange={e=>set('message_text',e.target.value)} required/>
          <p className="form-hint">{form.message_text.length} characters</p></div>
        <div className="form-group"><label>Repeat</label>
          <select value={form.repeat_type} onChange={e=>set('repeat_type',e.target.value)}>
            <option value="once">Once</option><option value="daily">Every day</option>
            <option value="weekly">Every week</option><option value="yearly">Every year</option>
          </select></div>
        <div className="form-row">
          <div className="form-group"><label>Date *</label>
            <input type="date" value={form.send_date} onChange={e=>set('send_date',e.target.value)} required/></div>
          <div className="form-group"><label>Time *</label>
            <input type="time" value={form.send_time} onChange={e=>set('send_time',e.target.value)} required/></div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:8}}>
          <button type="button" className="btn btn-ghost" onClick={()=>navigate('/messages')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading?'Saving...':'Save changes'}</button>
        </div>
      </form>
    </div>
  </div>);
}

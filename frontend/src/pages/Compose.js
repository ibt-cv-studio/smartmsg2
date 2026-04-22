import React,{useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createMessage} from '../services/api';
import {CATEGORIES} from '../components/CategoryMeta';
const STEPS=['Choose type','Write message','Receiver','Schedule'];
export default function Compose(){
  const navigate=useNavigate();
  const[step,setStep]=useState(0);const[error,setError]=useState('');const[loading,setLoading]=useState(false);
  const[form,setForm]=useState({category:'',message_text:'',receiver_name:'',receiver_phone:'',send_date:'',send_time:'',repeat_type:'once'});
  const selectedCat=CATEGORIES.find(c=>c.key===form.category);
  function set(f,v){setForm(p=>({...p,[f]:v}));}
  function pickCategory(cat){
    setForm(p=>({...p,category:cat.key,repeat_type:cat.defaultRepeat,
      message_text:cat.template.replace('{name}',form.receiver_name||'friend')}));
    setStep(1);
  }
  function next(){setError('');
    if(step===1&&!form.message_text.trim()){setError('Please write a message.');return;}
    if(step===2&&!form.receiver_phone.trim()){setError('Receiver phone is required.');return;}
    setStep(s=>s+1);}
  function back(){setError('');setStep(s=>s-1);}
  async function submit(){setError('');
    if(!form.send_date){setError('Please select a date.');return;}
    if(!form.send_time){setError('Please select a time.');return;}
    setLoading(true);
    try{await createMessage(form);navigate('/messages',{state:{success:'Message scheduled!'}});}
    catch(err){setError(err.response?.data?.errors?.[0]?.msg||err.response?.data?.error||'Failed to save.');}
    finally{setLoading(false);}
  }
  return(<div>
    <div className="page-header"><div><h2>New scheduled message</h2><p>Step {step+1} of {STEPS.length} — {STEPS[step]}</p></div></div>
    <div style={{display:'flex',gap:6,marginBottom:28}}>
      {STEPS.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:4,background:i<=step?'#4f8ef7':'#e8edf2',transition:'background 0.3s'}}/>)}
    </div>
    <div className="card">
      {error&&<div className="alert alert-error">{error}</div>}
      {step===0&&(<div>
        <h3 style={{marginBottom:20,fontSize:16}}>What kind of message do you want to send?</h3>
        <div className="cat-grid">{CATEGORIES.map(cat=>(<div key={cat.key} className={`cat-item ${form.category===cat.key?'selected':''}`} onClick={()=>pickCategory(cat)}>
          <div className="icon">{cat.icon}</div><div className="name">{cat.label}</div>
          <div style={{fontSize:11,color:'#999',marginTop:3}}>{cat.description}</div></div>))}</div></div>)}
      {step===1&&(<div>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
          <div style={{fontSize:32}}>{selectedCat?.icon}</div>
          <div><h3 style={{fontSize:16}}>{selectedCat?.label}</h3><p style={{fontSize:13,color:'#888'}}>Write the message the receiver will get</p></div>
        </div>
        <div className="form-group"><label>Message text</label>
          <textarea rows={5} value={form.message_text} onChange={e=>set('message_text',e.target.value)} placeholder="Write your message here..."/>
          <p className="form-hint">{form.message_text.length} characters</p></div>
        <div style={{display:'flex',gap:10}}><button className="btn btn-ghost" onClick={back}>Back</button><button className="btn btn-primary" onClick={next}>Next</button></div>
      </div>)}
      {step===2&&(<div>
        <h3 style={{fontSize:16,marginBottom:20}}>Who receives this message?</h3>
        <div className="form-group"><label>Receiver name (optional)</label>
          <input type="text" placeholder="e.g. Amina Mukiza" value={form.receiver_name} onChange={e=>set('receiver_name',e.target.value)}/></div>
        <div className="form-group"><label>Phone number *</label>
          <input type="tel" placeholder="+250 788 123 456" value={form.receiver_phone} onChange={e=>set('receiver_phone',e.target.value)} required/>
          <p className="form-hint">Include country code. Rwanda: +250, Uganda: +256, Kenya: +254</p></div>
        <div style={{display:'flex',gap:10}}><button className="btn btn-ghost" onClick={back}>Back</button><button className="btn btn-primary" onClick={next}>Next</button></div>
      </div>)}
      {step===3&&(<div>
        <h3 style={{fontSize:16,marginBottom:20}}>When should this message be sent?</h3>
        <div className="form-group"><label>Repeat</label>
          <select value={form.repeat_type} onChange={e=>set('repeat_type',e.target.value)}>
            <option value="once">Once — send on a specific date only</option>
            <option value="daily">Every day — same time each day</option>
            <option value="weekly">Every week — same day each week</option>
            <option value="yearly">Every year — same date each year</option>
          </select></div>
        <div className="form-row">
          <div className="form-group"><label>Date *</label>
            <input type="date" value={form.send_date} onChange={e=>set('send_date',e.target.value)} min={new Date().toISOString().split('T')[0]}/></div>
          <div className="form-group"><label>Time *</label>
            <input type="time" value={form.send_time} onChange={e=>set('send_time',e.target.value)}/></div>
        </div>
        <div style={{background:'#f7f9fc',borderRadius:10,padding:16,border:'1px solid #e8edf2',marginBottom:20}}>
          <p style={{fontSize:13,fontWeight:600,marginBottom:8}}>Summary</p>
          <p style={{fontSize:13,color:'#555',marginBottom:4}}><strong>Type:</strong> {form.category}</p>
          <p style={{fontSize:13,color:'#555',marginBottom:4}}><strong>To:</strong> {form.receiver_name||'—'} · {form.receiver_phone}</p>
          <p style={{fontSize:13,color:'#555',marginBottom:4}}><strong>Send at:</strong> {form.send_date} at {form.send_time}</p>
          <p style={{fontSize:13,color:'#777',marginTop:8,fontStyle:'italic'}}>"{form.message_text.substring(0,80)}{form.message_text.length>80?'...':''}"</p>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button className="btn btn-ghost" onClick={back}>Back</button>
          <button className="btn btn-primary" onClick={submit} disabled={loading}>{loading?'Saving...':'Schedule message'}</button>
        </div>
      </div>)}
    </div>
  </div>);
}

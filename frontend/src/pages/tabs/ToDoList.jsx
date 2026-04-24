import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, Trash2, Pill, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { getDashboard, addReminder, deleteReminder } from '../../lib/api';

const USER_ID = 'demo-user-001';
const TYPES = [
  { id:'medication',  label:'Medication',  icon:Pill,       color:'#3BBFBF', glow:'rgba(59,191,191,0.2)'  },
  { id:'appointment', label:'Appointment', icon:Calendar,   color:'#F4A261', glow:'rgba(244,162,97,0.2)'  },
  { id:'pension',     label:'Benefits',    icon:DollarSign, color:'#52B788', glow:'rgba(82,183,136,0.2)'  },
  { id:'general',     label:'Other',       icon:Clock,      color:'#9B8EC4', glow:'rgba(155,142,196,0.2)' },
];

export default function ToDoList() {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ type:'medication', title:'', time:'09:00', date:'' });
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState({});

  const load = useCallback(() => {
    getDashboard(USER_ID).then((d) => setReminders(d.reminders || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || !form.date) return;
    setLoading(true);
    try { await addReminder(USER_ID, form); setShowForm(false); setForm({ type:'medication', title:'', time:'09:00', date:'' }); load(); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (rid) => { try { await deleteReminder(USER_ID, rid); load(); } catch (_) {} };
  const toggleDone = (id) => setDone((p) => ({ ...p, [id]: !p[id] }));

  const G = {
    card:   { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' },
    header: { background:'linear-gradient(135deg,rgba(244,162,97,0.22),rgba(200,120,60,0.12))', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(244,162,97,0.28)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(244,162,97,0.18), inset 0 1px 0 rgba(255,255,255,0.1)' },
    form:   { background:'rgba(244,162,97,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(244,162,97,0.25)', borderRadius:20, padding:18 },
    tip:    { background:'rgba(59,191,191,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(59,191,191,0.2)', borderRadius:20, padding:16 },
  };

  return (
    <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:14 }}>

      {/* Header */}
      <div style={G.header}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={{ width:50, height:50, borderRadius:16, background:'rgba(244,162,97,0.2)', border:'1px solid rgba(244,162,97,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <CheckSquare size={26} color="#F4A261" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff' }}>My To-Do List</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Tasks, medicines & reminders</div>
          </div>
        </div>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>
          Keep track of medicines, appointments, and daily tasks in one simple place.
        </p>
      </div>

      {/* Add button */}
      <div style={{ display:'flex', justifyContent:'flex-end' }}>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ fontSize:14, padding:'12px 20px', display:'flex', alignItems:'center', gap:8 }}>
          <Plus size={16} /> Add Reminder
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fade-up" style={G.form}>
          <div style={{ display:'grid', gap:12 }}>
            <div>
              <label>Type of reminder</label>
              <select value={form.type} onChange={(e) => setForm({...form,type:e.target.value})}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label>What to remember?</label>
              <input placeholder="e.g. Take blood pressure pill" value={form.title} onChange={(e) => setForm({...form,title:e.target.value})} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form,date:e.target.value})} /></div>
              <div><label>Time</label><input type="time" value={form.time} onChange={(e) => setForm({...form,time:e.target.value})} /></div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn-primary" onClick={handleAdd} disabled={loading} style={{ fontSize:14, padding:'12px 20px' }}>{loading ? 'Saving…' : '✓ Save'}</button>
              <button className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {reminders.length === 0 && !showForm && (
        <div style={{ ...G.card, textAlign:'center', padding:40 }}>
          <CheckSquare size={48} color="rgba(255,255,255,0.15)" style={{ marginBottom:14 }} />
          <p style={{ fontSize:16, fontWeight:600, color:'rgba(255,255,255,0.5)' }}>No reminders yet</p>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.35)', marginTop:6 }}>Tap Add Reminder to get started</p>
        </div>
      )}

      {/* List */}
      {reminders.map((r) => {
        const typeInfo = TYPES.find((t) => t.id === r.type) || TYPES[3];
        const Icon = typeInfo.icon;
        const isDone = done[r.id];
        return (
          <div key={r.id} className="reminder-card" style={{ opacity: isDone ? 0.5 : 1 }}>
            <div className="reminder-icon-wrap" style={{ background: typeInfo.glow, border:`1px solid ${typeInfo.color}44` }}>
              <Icon size={22} color={typeInfo.color} />
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="reminder-title" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{r.title}</div>
              <div className="reminder-time">{r.date} at {r.time}</div>
            </div>
            <button onClick={() => toggleDone(r.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:6 }}>
              <CheckCircle size={22} color={isDone ? '#52B788' : 'rgba(255,255,255,0.2)'} />
            </button>
            <button onClick={() => handleDelete(r.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:6 }}>
              <Trash2 size={18} color="rgba(255,255,255,0.3)" />
            </button>
          </div>
        );
      })}

      <div style={G.tip}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--teal)', marginBottom:4 }}>💊 Tip</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>Take medicines at the same time every day — link it to a meal so you never forget.</p>
      </div>
    </div>
  );
}

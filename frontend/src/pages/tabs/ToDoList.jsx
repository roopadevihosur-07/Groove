import { useState, useEffect, useCallback } from 'react';
import { CheckSquare, Plus, Trash2, Pill, Calendar, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { getDashboard, addReminder, deleteReminder } from '../../lib/api';

const USER_ID = 'demo-user-001';

const TYPES = [
  { id:'medication',  label:'Medication',   icon:Pill,       color:'#3BBFBF', bg:'#E4F7F7' },
  { id:'appointment', label:'Appointment',  icon:Calendar,   color:'#F4A261', bg:'#FEF5EC' },
  { id:'pension',     label:'Benefits',     icon:DollarSign, color:'#52B788', bg:'#EBF7F2' },
  { id:'general',     label:'Other task',   icon:Clock,      color:'#9B8EC4', bg:'#F2F0FA' },
];

export default function ToDoList() {
  const [reminders, setReminders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:'medication', title:'', time:'09:00', date:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState({});

  const load = useCallback(() => {
    getDashboard(USER_ID).then((d) => setReminders(d.reminders || [])).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.title || !form.date) return;
    setLoading(true);
    try {
      await addReminder(USER_ID, form);
      setShowForm(false);
      setForm({ type:'medication', title:'', time:'09:00', date:'' });
      load();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (rid) => {
    try { await deleteReminder(USER_ID, rid); load(); } catch (_) {}
  };

  const toggleDone = (id) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#F4A261,#E07840)', margin:'20px 20px 0', borderRadius:'var(--radius-lg)', padding:22, color:'#fff', boxShadow:'0 8px 28px rgba(244,162,97,0.35)' }}>
        <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:10 }}>
          <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <CheckSquare size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>My To-Do List</div>
            <div style={{ fontSize:13,opacity:0.85 }}>Tasks, medicines & reminders</div>
          </div>
        </div>
        <p style={{ fontSize:14,opacity:0.9,lineHeight:1.65 }}>
          Keep track of your medicines, appointments, and daily tasks in one simple place.
        </p>
      </div>

      {/* Add button */}
      <div style={{ margin:'16px 20px 0',display:'flex',justifyContent:'flex-end' }}>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize:15,padding:'13px 22px',display:'flex',alignItems:'center',gap:8 }}
        >
          <Plus size={18} /> Add Reminder
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="fade-up" style={{ margin:'12px 20px 0',background:'var(--amber-light)',borderRadius:'var(--radius-md)',padding:18,border:'1.5px solid rgba(244,162,97,0.4)' }}>
          <div style={{ display:'grid',gap:12 }}>
            <div>
              <label>What type of reminder?</label>
              <select value={form.type} onChange={(e) => setForm({...form,type:e.target.value})}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label>What do you want to remember?</label>
              <input placeholder="e.g. Take blood pressure pill" value={form.title} onChange={(e) => setForm({...form,title:e.target.value})} />
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12 }}>
              <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({...form,date:e.target.value})} /></div>
              <div><label>Time</label><input type="time" value={form.time} onChange={(e) => setForm({...form,time:e.target.value})} /></div>
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <button className="btn-primary" onClick={handleAdd} disabled={loading} style={{ fontSize:15,padding:'13px 22px' }}>
                {loading ? 'Saving…' : '✓  Save'}
              </button>
              <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize:15 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ margin:'16px 20px 0',display:'flex',flexDirection:'column',gap:10 }}>
        {reminders.length === 0 && !showForm && (
          <div style={{ textAlign:'center',padding:'40px 20px',color:'var(--text-muted)' }}>
            <CheckSquare size={48} color="var(--text-muted)" style={{ marginBottom:12,opacity:0.4 }} />
            <p style={{ fontSize:16,fontWeight:600 }}>No reminders yet</p>
            <p style={{ fontSize:14,marginTop:6 }}>Tap "Add Reminder" to get started</p>
          </div>
        )}
        {reminders.map((r) => {
          const typeInfo = TYPES.find((t) => t.id === r.type) || TYPES[3];
          const Icon = typeInfo.icon;
          const isDone = done[r.id];
          return (
            <div key={r.id} className="reminder-card" style={{ opacity: isDone ? 0.55 : 1 }}>
              <div className="reminder-icon-wrap" style={{ background: typeInfo.bg }}>
                <Icon size={22} color={typeInfo.color} />
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div className="reminder-title" style={{ textDecoration: isDone ? 'line-through' : 'none' }}>{r.title}</div>
                <div className="reminder-time">{r.date} at {r.time}</div>
              </div>
              <button onClick={() => toggleDone(r.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:6 }}>
                <CheckCircle size={22} color={isDone ? 'var(--green)' : 'var(--border)'} />
              </button>
              <button onClick={() => handleDelete(r.id)} style={{ background:'none',border:'none',cursor:'pointer',padding:6 }}>
                <Trash2 size={18} color="var(--text-muted)" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div style={{ margin:'20px 20px 0',background:'var(--teal-light)',borderRadius:'var(--radius-md)',padding:16,border:'1px solid var(--teal-mid)' }}>
        <p style={{ fontSize:14,fontWeight:700,color:'var(--teal-dark)',marginBottom:4 }}>💊 Medication tip</p>
        <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>Take your medicines at the same time every day — link it to a meal or bedtime so you never forget.</p>
      </div>
    </div>
  );
}

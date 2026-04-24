import { useState } from 'react';
import { Bell, Plus, Trash2, Clock, Pill, Calendar, DollarSign } from 'lucide-react';
import { addReminder, deleteReminder } from '../lib/api';

const TYPES = [
  { id: 'medication',  label: 'Medication',  icon: Pill,       color: '#3BBFBF', bg: '#E4F7F7' },
  { id: 'appointment', label: 'Appointment', icon: Calendar,   color: '#F4A261', bg: '#FEF5EC' },
  { id: 'pension',     label: 'Benefits',    icon: DollarSign, color: '#52B788', bg: '#EBF7F2' },
  { id: 'general',     label: 'General',     icon: Clock,      color: '#9B8EC4', bg: '#F2F0FA' },
];

export default function ReminderPanel({ userId, reminders = [], onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'medication', title: '', time: '09:00', date: '' });
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (!form.title || !form.date) return;
    setLoading(true);
    try {
      await addReminder(userId, form);
      setShowForm(false);
      setForm({ type: 'medication', title: '', time: '09:00', date: '' });
      onRefresh?.();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleDelete = async (rid) => {
    try { await deleteReminder(userId, rid); onRefresh?.(); }
    catch (e) { console.error(e); }
  };

  return (
    <div>
      {/* Add button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px', marginBottom: 12 }}>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ fontSize: 13, padding: '9px 18px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Reminder
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="add-reminder-form fade-up">
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label>What to remind</label>
              <input placeholder="e.g. Blood pressure medication" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div><label>Date</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div><label>Time</label><input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={handleAdd} disabled={loading} style={{ fontSize: 13, padding: '9px 18px' }}>
                {loading ? 'Saving…' : 'Save'}
              </button>
              <button className="btn-ghost" onClick={() => setShowForm(false)} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {reminders.length === 0 && !showForm && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '32px 20px' }}>
          No reminders yet. Tap Add Reminder to create one.
        </p>
      )}

      <div className="reminder-list">
        {reminders.map((r) => {
          const typeInfo = TYPES.find((t) => t.id === r.type) || TYPES[3];
          const Icon = typeInfo.icon;
          return (
            <div key={r.id} className="reminder-card">
              <div className="reminder-icon-wrap" style={{ background: typeInfo.bg }}>
                <Icon size={18} color={typeInfo.color} />
              </div>
              <div className="reminder-info">
                <div className="reminder-title">{r.title}</div>
                <div className="reminder-time">{r.date} at {r.time}</div>
              </div>
              <button onClick={() => handleDelete(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8 }}>
                <Trash2 size={15} color="var(--text-muted)" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Shield, Bell, Phone, Activity, AlertTriangle, CheckCircle, Clock, ArrowLeft } from 'lucide-react';
import { getDashboard } from '../lib/api';
import { useLiveDashboard } from '../hooks/useLiveDashboard';

const EVENT_CONFIG = {
  call_started:      { icon: Phone,         color: '#3BBFBF', bg: '#E4F7F7', label: 'Call started' },
  call_ended:        { icon: Phone,         color: '#9BB0BE', bg: '#F0F4F6', label: 'Call ended' },
  scam_detected:     { icon: AlertTriangle, color: '#F07167', bg: '#FEF0EF', label: 'Scam detected!' },
  reminder_added:    { icon: Bell,          color: '#F4A261', bg: '#FEF5EC', label: 'Reminder added' },
  appointment_booked:{ icon: CheckCircle,   color: '#52B788', bg: '#EBF7F2', label: 'Appointment booked' },
  family_alert:      { icon: AlertTriangle, color: '#F07167', bg: '#FEF0EF', label: 'Family alert' },
};

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
      <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function FamilyDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const USER_ID = 'demo-user-001';

  const loadDashboard = useCallback(async () => {
    try { setDashboard(await getDashboard(USER_ID)); } catch (_) {}
  }, []);

  useEffect(() => {
    loadDashboard();
    const t = setInterval(loadDashboard, 30000);
    return () => clearInterval(t);
  }, [loadDashboard]);

  const isConnected = useLiveDashboard(USER_ID, (event) => {
    setLiveEvents((prev) => [{ ...event, ts: event.ts || Date.now() }, ...prev].slice(0, 50));
    loadDashboard();
  });

  const stats = dashboard?.stats || {};
  const reminders = dashboard?.reminders || [];
  const scamAlerts = dashboard?.scamAlerts || [];
  const recentCalls = dashboard?.callLog?.slice(0, 4) || [];

  return (
    <div className="dashboard-page" style={{ padding: '0 0 20px' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,rgba(59,191,191,0.25),rgba(91,164,207,0.15))', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.12)', padding: '24px 20px 28px', marginBottom: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 }}>Family Monitor</div>
            <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 22, fontWeight: 800, color: '#fff' }}>Guardian Dashboard</div>
          </div>
          <div className="live-badge">
            <div className="live-dot" style={{ background: isConnected ? undefined : '#F07167' }} />
            {isConnected ? 'Live' : 'Offline'}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '20px 20px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <StatCard label="Total calls"      value={stats.totalCalls || 0}      icon={Phone}         color="var(--teal)"  bg="var(--teal-light)" />
        <StatCard label="Scams blocked"    value={stats.scamsBlocked || 0}    icon={Shield}        color="var(--coral)" bg="var(--coral-light)" />
        <StatCard label="Active reminders" value={stats.activeReminders || 0} icon={Bell}          color="var(--amber)" bg="var(--amber-light)" />
        <StatCard label="Scam alerts"      value={scamAlerts.length}           icon={AlertTriangle} color="#9BB0BE"      bg="var(--blue-light)" />
      </div>

      {/* Live activity feed */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">Live Activity</div>
          {isConnected && <div className="live-badge"><div className="live-dot" /> Live</div>}
        </div>
        <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', margin:'0 20px' }}>
          {liveEvents.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, padding: '20px 0' }}>Waiting for activity…</p>
          )}
          <div className="event-feed">
            {liveEvents.map((e, i) => {
              const cfg = EVENT_CONFIG[e.type] || { icon: Activity, color: '#9BB0BE', bg: '#F0F4F6', label: e.type };
              const Icon = cfg.icon;
              return (
                <div key={i} className="event-item fade-up">
                  <div className="event-icon-wrap" style={{ background: cfg.bg }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div className="event-content">
                    <div className="event-label" style={{ color: cfg.color }}>{cfg.label}</div>
                    {e.summary && <div className="event-detail">{e.summary}</div>}
                    {e.details?.explanation && <div className="event-detail">{e.details.explanation}</div>}
                    {e.details?.action && <div className="event-detail" style={{ color: 'var(--coral)' }}>{e.details.action}</div>}
                  </div>
                  <div className="event-time">
                    {e.ts ? new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent calls */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">Recent Calls</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', margin:'0 20px' }}>
          {recentCalls.length === 0 && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No calls yet.</p>}
          {recentCalls.map((call, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < recentCalls.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={16} color="var(--teal)" />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{call.summary || 'Voice call'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(call.ts).toLocaleDateString()}{call.duration ? ` · ${Math.round(call.duration)}s` : ''}</div>
                </div>
              </div>
              <span style={{ fontSize: 11, background: 'var(--teal-light)', color: 'var(--teal)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>Done</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming reminders */}
      <div style={{ marginBottom: 20 }}>
        <div className="section-header">
          <div className="section-title">Upcoming Reminders</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.3)', margin:'0 20px' }}>
          {reminders.length === 0 && <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No reminders scheduled.</p>}
          {reminders.slice(0, 4).map((r, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < Math.min(reminders.length, 4) - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--amber-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={16} color="var(--amber)" />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.title}</div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{r.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Current scam threats */}
      {scamAlerts.length > 0 && (
        <div>
          <div className="section-header">
            <div className="section-title">Current Scam Threats</div>
            <span style={{ fontSize: 12, background: 'var(--coral-light)', color: 'var(--coral)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>{scamAlerts.length} active</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
            {scamAlerts.slice(0, 3).map((a, i) => (
              <div key={i} className="alert-card">
                <div className="alert-card-title">{a.title}</div>
                <div className="alert-card-desc">{a.description?.slice(0, 80)}…</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

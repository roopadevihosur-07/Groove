import { useEffect, useState, useCallback } from 'react';
import { Phone, Shield, Bell, HelpCircle, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import { useVapi } from '../hooks/useVapi';
import { useLiveDashboard } from '../hooks/useLiveDashboard';
import { getDashboard, analyzeCall, queryKnowledge } from '../lib/api';
import VoiceOrb from '../components/VoiceOrb';
import ScamAlertBanner from '../components/ScamAlertBanner';
import ReminderPanel from '../components/ReminderPanel';

const SERVICES = [
  { id: 'call',      label: 'Call Guardian', icon: Phone,    color: '#3BBFBF', bg: '#E4F7F7', agent: 'scam' },
  { id: 'alerts',    label: 'Scam Alerts',   icon: Shield,   color: '#F07167', bg: '#FEF0EF', agent: null },
  { id: 'reminders', label: 'Reminders',     icon: Bell,     color: '#F4A261', bg: '#FEF5EC', agent: null },
  { id: 'check',     label: 'Check a Call',  icon: HelpCircle, color: '#9B8EC4', bg: '#F2F0FA', agent: null },
  { id: 'schedule',  label: 'Book Appt',     icon: Calendar, color: '#52B788', bg: '#EBF7F2', agent: 'scheduler' },
  { id: 'learn',     label: 'Learn AI',      icon: BookOpen, color: '#5BA4CF', bg: '#EAF4FB', agent: 'educator' },
];

export default function ElderView({ userId, tab, setTab }) {
  const { callState, transcript, activeAgent, isMuted, volumeLevel, startCall, endCall, toggleMute } = useVapi(userId);
  const [dashboard, setDashboard] = useState(null);
  const [suspiciousText, setSuspiciousText] = useState('');
  const [scamResult, setScamResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [liveAlert, setLiveAlert] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('scam');
  const [learnQuery, setLearnQuery] = useState('');
  const [learnResult, setLearnResult] = useState(null);
  const [learnLoading, setLearnLoading] = useState(false);
  const [learnTopic, setLearnTopic] = useState(null);

  const loadDashboard = useCallback(async () => {
    try { setDashboard(await getDashboard(userId)); } catch (_) {}
  }, [userId]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useLiveDashboard(userId, (event) => {
    if (event.type === 'scam_detected') setLiveAlert(event);
    if (['reminder_added', 'appointment_booked'].includes(event.type)) loadDashboard();
  });

  const handleScamCheck = async () => {
    if (!suspiciousText.trim()) return;
    setAnalyzing(true);
    setScamResult(null);
    try {
      const result = await analyzeCall(userId, suspiciousText);
      setScamResult(result);
    } catch (_) {
      setScamResult({ is_scam: true, confidence: 70, scam_type: 'Unknown', explanation: 'This call sounds suspicious. When in doubt, hang up.', action: 'Call your family or a trusted friend.' });
    }
    setAnalyzing(false);
  };

  const handleLearn = async (query) => {
    const q = query || learnQuery;
    if (!q.trim()) return;
    setLearnLoading(true);
    setLearnResult(null);
    setLearnTopic(q);
    try {
      const data = await queryKnowledge(q);
      setLearnResult(data.result || 'No information found. Try asking something else.');
    } catch (_) {
      setLearnResult('Sorry, I could not find that information right now. Please try again.');
    }
    setLearnLoading(false);
  };

  const handleServiceTap = (svc) => {
    if (svc.agent) {
      setSelectedAgent(svc.agent);
      setTab('call');
    } else {
      setTab(svc.id);
    }
  };

  const stats = dashboard?.stats || {};

  return (
    <div style={{ paddingBottom: 80 }}>

      {/* ── Header ── */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="header-greeting">
          <div className="sub">Welcome back!</div>
          <div className="title">Stay <span>Safe & Healthy</span></div>
        </div>
        <div className="header-avatar">G</div>
      </div>

      {/* ── Live scam alert ── */}
      {liveAlert && (
        <div className="fade-up" style={{ margin: '12px 20px 0', background: 'var(--coral-light)', border: '1px solid rgba(240,113,103,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Shield size={16} color="var(--coral)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--coral)' }}>Scam Alert!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{liveAlert.result?.action || 'Stay safe. Hang up suspicious calls.'}</p>
          </div>
          <button onClick={() => setLiveAlert(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* ── HOME TAB ── */}
      {tab === 'home' && (
        <>
          {/* Hero banner */}
          <div className="hero-banner">
            <div className="hero-label">GuardianVoice AI</div>
            <div className="hero-title">Your trusted companion, always here</div>
            <div className="hero-subtitle">Talk to your AI assistant for scam protection, appointments, and reminders.</div>
            <button className="hero-btn" onClick={() => setTab('call')}>
              <Phone size={16} />
              Call GuardianVoice
            </button>
          </div>

          {/* Stats */}
          <div className="section">
            <div className="stats-row">
              {[
                { label: 'Calls made',    value: stats.totalCalls || 0,     color: 'var(--teal)' },
                { label: 'Scams blocked', value: stats.scamsBlocked || 0,   color: 'var(--coral)' },
                { label: 'Reminders',     value: stats.activeReminders || 0, color: 'var(--amber)' },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Services grid */}
          <div className="section">
            <div className="section-header">
              <div className="section-title">Quick Actions</div>
            </div>
            <div className="services-grid">
              {SERVICES.map((svc) => {
                const Icon = svc.icon;
                return (
                  <div key={svc.id} className="service-card" onClick={() => handleServiceTap(svc)}>
                    <div className="service-icon" style={{ background: svc.bg }}>
                      <Icon size={24} color={svc.color} />
                    </div>
                    <div className="service-label">{svc.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent scam alerts preview */}
          {dashboard?.scamAlerts?.length > 0 && (
            <div className="section">
              <div className="section-header">
                <div className="section-title">Active Scam Alerts</div>
                <button className="section-link" onClick={() => setTab('alerts')}>See all</button>
              </div>
              <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {dashboard.scamAlerts.slice(0, 2).map((a, i) => (
                  <div key={i} className="alert-card" onClick={() => setTab('alerts')}>
                    <div className="alert-card-title">{a.title}</div>
                    <div className="alert-card-desc">{a.description?.slice(0, 90)}…</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── CALL TAB ── */}
      {tab === 'call' && (
        <div className="voice-screen fade-up">
          <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 8 }}>
            <div style={{ fontSize: 20, fontFamily: 'Nunito, sans-serif', fontWeight: 800, color: 'var(--text-primary)' }}>GuardianVoice</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>AI voice assistant</div>
          </div>
          <VoiceOrb
            callState={callState}
            activeAgent={activeAgent}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            isMuted={isMuted}
            volumeLevel={volumeLevel}
            onStart={startCall}
            onEnd={endCall}
            onMute={toggleMute}
          />
          {transcript.length > 0 && (
            <div className="transcript-box">
              {transcript.map((t, i) => (
                <div key={i} className={`transcript-bubble ${t.role}`}>{t.text}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ALERTS TAB ── */}
      {tab === 'alerts' && (
        <div className="fade-up" style={{ paddingTop: 20 }}>
          <div className="section-header">
            <div className="section-title">Scam Alerts</div>
            <span style={{ fontSize: 12, background: 'var(--coral-light)', color: 'var(--coral)', padding: '3px 10px', borderRadius: 99, fontWeight: 600 }}>
              {dashboard?.scamAlerts?.length || 0} active
            </span>
          </div>
          {dashboard?.scamAlerts?.length
            ? <ScamAlertBanner alerts={dashboard.scamAlerts} />
            : <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>Loading live scam alerts…</p>
          }
        </div>
      )}

      {/* ── REMINDERS TAB ── */}
      {tab === 'reminders' && (
        <div className="fade-up" style={{ paddingTop: 20 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title">My Reminders</div>
          </div>
          <ReminderPanel userId={userId} reminders={dashboard?.reminders || []} onRefresh={loadDashboard} />

          {dashboard?.benefits?.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div className="section-header" style={{ marginBottom: 12 }}>
                <div className="section-title">Upcoming Benefits</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 20px' }}>
                {dashboard.benefits.map((b, i) => (
                  <div key={i} style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-md)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{b.type}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{b.date}</div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: b.amount?.startsWith('-') ? 'var(--coral)' : 'var(--green)' }}>{b.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── LEARN AI TAB ── */}
      {tab === 'learn' && (
        <div className="fade-up" style={{ paddingTop: 20 }}>
          <div className="section-header" style={{ marginBottom: 6 }}>
            <div className="section-title">Learn About AI</div>
          </div>
          <p style={{ padding: '0 20px 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Ask any question about AI, deepfakes, scams, or technology — explained simply.
          </p>

          {/* Quick topic pills */}
          <div style={{ padding: '0 20px', display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {['What is AI?', 'What is a deepfake?', 'Phone scams', 'Pension & benefits', 'Medication tips'].map((topic) => (
              <button
                key={topic}
                onClick={() => { setLearnQuery(topic); handleLearn(topic); }}
                style={{
                  padding: '8px 14px', borderRadius: 99, border: '1.5px solid var(--border)',
                  background: learnTopic === topic ? 'var(--blue-light)' : 'var(--card-bg)',
                  color: learnTopic === topic ? 'var(--blue)' : 'var(--text-secondary)',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Poppins, sans-serif',
                  borderColor: learnTopic === topic ? 'var(--blue)' : 'var(--border)',
                  transition: 'all 0.15s',
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div style={{ padding: '0 20px', marginBottom: 16 }}>
            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <BookOpen size={20} color="var(--blue)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Ask a question</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type anything you'd like to understand</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="e.g. What is a deepfake?"
                  value={learnQuery}
                  onChange={(e) => setLearnQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLearn()}
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  className="btn-primary"
                  onClick={() => handleLearn()}
                  disabled={learnLoading || !learnQuery.trim()}
                  style={{ fontSize: 13, padding: '10px 18px', whiteSpace: 'nowrap' }}
                >
                  {learnLoading ? '…' : 'Ask'}
                </button>
              </div>
            </div>
          </div>

          {/* Answer */}
          {learnLoading && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid var(--teal-mid)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Looking that up for you…</p>
            </div>
          )}

          {learnResult && !learnLoading && (
            <div className="fade-up" style={{ padding: '0 20px' }}>
              <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)', borderLeft: '4px solid var(--blue)' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <BookOpen size={16} color="var(--blue)" />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{learnTopic}</div>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{learnResult}</p>
                <button
                  className="btn-primary"
                  onClick={() => { setSelectedAgent('educator'); setTab('call'); }}
                  style={{ marginTop: 16, fontSize: 13, padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <BookOpen size={14} /> Talk to AI educator
                </button>
              </div>
            </div>
          )}

          {/* Tip box */}
          {!learnResult && !learnLoading && (
            <div style={{ margin: '0 20px', background: 'var(--blue-light)', borderRadius: 'var(--radius-md)', padding: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue)', marginBottom: 6 }}>Did you know?</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                AI assistants like GuardianVoice are programmed to help you — they cannot access your bank account or personal information unless you share it. You are always in control.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── CHECK A CALL TAB ── */}
      {tab === 'check' && (
        <div className="fade-up" style={{ paddingTop: 20 }}>
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title">Check a Suspicious Call</div>
          </div>
          <div className="scam-check-area">
            <div style={{ background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)', marginBottom: 0 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <HelpCircle size={20} color="var(--purple)" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Got a suspicious call?</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Describe it — we'll check instantly</div>
                </div>
              </div>
              <textarea
                rows={4}
                placeholder="e.g. Someone called saying my Medicare was suspended and I need to pay $500 in gift cards…"
                value={suspiciousText}
                onChange={(e) => setSuspiciousText(e.target.value)}
                style={{ resize: 'none', marginBottom: 12, fontSize: 14 }}
              />
              <button className="btn-primary" onClick={handleScamCheck} disabled={analyzing || !suspiciousText.trim()} style={{ width: '100%', fontSize: 15, padding: '13px' }}>
                {analyzing ? 'Checking…' : 'Check this call'}
              </button>
            </div>

            {scamResult && (
              <div className={`result-card fade-up ${scamResult.is_scam ? 'danger' : 'safe'}`}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, background: scamResult.is_scam ? 'rgba(240,113,103,0.15)' : 'rgba(82,183,136,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {scamResult.is_scam ? <Shield size={20} color="var(--coral)" /> : <CheckCircle size={20} color="var(--green)" />}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: scamResult.is_scam ? 'var(--coral)' : 'var(--green)' }}>
                      {scamResult.is_scam ? `Warning: Likely a scam (${scamResult.confidence}%)` : 'Looks legitimate'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{scamResult.scam_type}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10 }}>{scamResult.explanation}</p>
                <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>What to do: {scamResult.action}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

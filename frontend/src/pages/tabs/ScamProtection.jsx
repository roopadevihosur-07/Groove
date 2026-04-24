import { useState, useEffect, useRef, useCallback } from 'react';
import { Shield, Phone, PhoneOff, Mic, MicOff, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Calendar, BookOpen } from 'lucide-react';
import { getDashboard, analyzeCall } from '../../lib/api';

const USER_ID = 'demo-user-001';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const AGENTS = [
  {
    id: 'scam',
    label: 'Scam Protection',
    icon: Shield,
    color: '#F07167',
    glow: 'rgba(240,113,103,0.25)',
    border: 'rgba(240,113,103,0.5)',
    agentId: import.meta.env.VITE_VAPI_SCAM_AGENT_ID,
  },
  {
    id: 'scheduler',
    label: 'Book Appointment',
    icon: Calendar,
    color: '#52B788',
    glow: 'rgba(82,183,136,0.2)',
    border: 'rgba(82,183,136,0.4)',
    agentId: import.meta.env.VITE_VAPI_SCHEDULER_AGENT_ID,
  },
  {
    id: 'educator',
    label: 'Learn About AI',
    icon: BookOpen,
    color: '#5BA4CF',
    glow: 'rgba(91,164,207,0.2)',
    border: 'rgba(91,164,207,0.4)',
    agentId: import.meta.env.VITE_VAPI_EDUCATOR_AGENT_ID,
  },
];

function useVoiceCall() {
  const [callState, setCallState] = useState('idle'); // idle | connecting | active | ended
  const [transcript, setTranscript] = useState([]);
  const [volume, setVolume]         = useState(0);
  const [isMuted, setIsMuted]       = useState(false);
  const vapiRef = useRef(null);

  const cleanup = useCallback(() => {
    try { vapiRef.current?.stop?.(); } catch (_) {}
    vapiRef.current = null;
  }, []);

  const startCall = useCallback(async (agentId) => {
    setCallState('connecting');
    setTranscript([]);
    setVolume(0);

    // Demo mode — no real VAPI key
    if (!agentId || !VAPI_PUBLIC_KEY || VAPI_PUBLIC_KEY === 'demo') {
      setCallState('active');
      setTimeout(() => {
        setTranscript([{ role: 'assistant', text: "Hello! I'm GuardianVoice. I'm here to help keep you safe from scams. How can I help you today?" }]);
      }, 800);
      return;
    }

    try {
      const { default: Vapi } = await import('@vapi-ai/web');
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start',   () => setCallState('active'));
      vapi.on('call-end',     () => { setCallState('ended'); setTimeout(() => setCallState('idle'), 2500); });
      vapi.on('volume-level', (v) => setVolume(v));
      vapi.on('message', (msg) => {
        if (msg.type === 'transcript' && msg.transcriptType === 'final') {
          setTranscript((prev) => [...prev, { role: msg.role, text: msg.transcript }]);
        }
      });
      vapi.on('error', () => { cleanup(); setCallState('idle'); });

      await vapi.start(agentId);
    } catch (err) {
      console.error('[Groove voice]', err);
      cleanup();
      setCallState('idle');
    }
  }, [cleanup]);

  const endCall = useCallback(() => {
    cleanup();
    setCallState('ended');
    setTimeout(() => setCallState('idle'), 2000);
  }, [cleanup]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted((m) => !m);
    }
  }, [isMuted]);

  return { callState, transcript, volume, isMuted, startCall, endCall, toggleMute };
}

export default function ScamProtection() {
  const [selectedAgent, setSelectedAgent] = useState('scam');
  const [alerts, setAlerts]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [text, setText]       = useState('');
  const [result, setResult]   = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const transcriptEndRef = useRef(null);

  const { callState, transcript, volume, isMuted, startCall, endCall, toggleMute } = useVoiceCall();

  useEffect(() => {
    getDashboard(USER_ID).then((d) => setAlerts(d.scamAlerts || [])).catch(() => {});
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  const handleCheck = async () => {
    if (!text.trim()) return;
    setAnalyzing(true); setResult(null);
    try {
      const r = await analyzeCall(USER_ID, text);
      setResult(r);
    } catch (_) {
      setResult({ is_scam: true, confidence: 70, scam_type: 'Suspicious', explanation: 'This call sounds suspicious. Hang up to be safe.', action: 'Call your family before doing anything.' });
    }
    setAnalyzing(false);
  };

  const agent   = AGENTS.find((a) => a.id === selectedAgent);
  const isIdle  = callState === 'idle';
  const isActive = callState === 'active';
  const isConnecting = callState === 'connecting';
  const isEnded = callState === 'ended';

  const G = {
    card: { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.35)' },
    tip:  { background:'rgba(59,191,191,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(59,191,191,0.2)', borderRadius:20, padding:16 },
  };

  return (
    <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:16 }}>

      {/* ── CALL GUARDIANOICE SECTION ── */}
      <div style={{ background:'rgba(255,255,255,0.06)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.13)', borderRadius:28, padding:24, boxShadow:'0 12px 40px rgba(0,0,0,0.4)' }}>

        {/* Title */}
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <h2 style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:22, color:'#fff', marginBottom:4 }}>
            Call GuardianVoice
          </h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)' }}>Select a helper, then tap the button to call</p>
        </div>

        {/* Agent selector pills */}
        <div style={{ display:'flex', gap:8, justifyContent:'center', marginBottom:28, flexWrap:'wrap' }}>
          {AGENTS.map((a) => {
            const Icon = a.icon;
            const sel = selectedAgent === a.id;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAgent(a.id)}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  padding:'10px 16px', borderRadius:99,
                  background: sel ? a.glow : 'rgba(255,255,255,0.06)',
                  border: sel ? `2px solid ${a.border}` : '1px solid rgba(255,255,255,0.15)',
                  color: sel ? a.color : 'rgba(255,255,255,0.55)',
                  fontSize:13, fontWeight:700, fontFamily:'Poppins,sans-serif',
                  cursor:'pointer', transition:'all 0.2s',
                  boxShadow: sel ? `0 0 20px ${a.glow}` : 'none',
                }}
              >
                <div style={{ width:26, height:26, borderRadius:8, background: sel ? `${a.color}33` : 'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon size={14} color={sel ? a.color : 'rgba(255,255,255,0.4)'} />
                </div>
                {a.label}
              </button>
            );
          })}
        </div>

        {/* ── Pulsing orb ── */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>

            {/* Pulse rings — only when active */}
            {isActive && (
              <>
                <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', border:`2px solid ${agent.color}`, opacity:0.5, animation:'orbPulse 2s ease-out infinite' }} />
                <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', border:`2px solid ${agent.color}`, opacity:0.25, animation:'orbPulse 2s ease-out 0.75s infinite' }} />
              </>
            )}

            {/* Glow ring behind orb — always */}
            {!isIdle && (
              <div style={{ position:'absolute', width:130, height:130, borderRadius:'50%', background: isActive ? `radial-gradient(circle, ${agent.glow}, transparent 70%)` : 'none', filter:'blur(12px)' }} />
            )}

            {/* Main orb button */}
            <button
              onClick={isActive || isEnded ? endCall : () => startCall(agent.agentId)}
              disabled={isConnecting}
              style={{
                width: 130, height: 130, borderRadius:'50%', border:'none',
                background: isActive
                  ? `linear-gradient(135deg, ${agent.color}, ${agent.color}BB)`
                  : isConnecting || isEnded
                    ? 'linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0.08))'
                    : `linear-gradient(135deg, ${agent.color}CC, ${agent.color}88)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                cursor: isConnecting ? 'wait' : 'pointer',
                boxShadow: isActive
                  ? `0 0 40px ${agent.glow}, 0 12px 40px rgba(0,0,0,0.4)`
                  : `0 0 20px ${agent.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
                transition:'all 0.3s',
                position:'relative', zIndex:1,
                backdropFilter:'blur(8px)',
              }}
            >
              {isConnecting
                ? <div style={{ width:40, height:40, border:'3px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                : isActive
                  ? <PhoneOff size={48} color="#fff" />
                  : <Phone size={48} color="#fff" />
              }
            </button>
          </div>

          {/* Waveform when active */}
          {isActive && (
            <div style={{ display:'flex', gap:4, alignItems:'center', height:32 }}>
              {[1,2,3,4,5,6,7].map((i) => (
                <div key={i} style={{ width:4, borderRadius:2, background: agent.color, height:`${10 + volume * 26}px`, animation:`wave 0.8s ease-in-out ${i*0.1}s infinite`, opacity:0.9 }} />
              ))}
            </div>
          )}

          {/* Status label */}
          <div style={{ textAlign:'center' }}>
            {isIdle && (
              <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:18, color:'rgba(255,255,255,0.8)' }}>
                Tap to call — {agent.label}
              </p>
            )}
            {isConnecting && <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:18, color:'rgba(255,255,255,0.6)' }}>Connecting…</p>}
            {isActive && (
              <div>
                <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:18, color: agent.color }}>
                  Connected — GuardianVoice is listening
                </p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', marginTop:4 }}>Tap orb to end call</p>
              </div>
            )}
            {isEnded && <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:18, color:'#52B788' }}>Call ended. Stay safe! ✓</p>}
          </div>

          {/* Mute */}
          {isActive && (
            <button onClick={toggleMute} className="btn-ghost" style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
              {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
          )}
        </div>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div style={{ marginTop:20, borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:16 }}>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>Conversation</p>
            <div style={{ maxHeight:220, overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
              {transcript.map((t, i) => (
                <div key={i} style={{ display:'flex', justifyContent: t.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth:'82%', padding:'10px 14px', borderRadius:18, fontSize:14, lineHeight:1.55,
                    background: t.role === 'user'
                      ? `linear-gradient(135deg, ${agent.color}, ${agent.color}BB)`
                      : 'rgba(255,255,255,0.1)',
                    color:'#fff',
                    backdropFilter:'blur(8px)',
                    border: t.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    borderBottomRightRadius: t.role === 'user' ? 4 : 18,
                    borderBottomLeftRadius:  t.role === 'assistant' ? 4 : 18,
                  }}>
                    {t.text}
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* ── Text check section ── */}
      <div style={G.card}>
        <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
          <div style={{ width:44, height:44, borderRadius:14, background:'rgba(240,113,103,0.15)', border:'1px solid rgba(240,113,103,0.25)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Phone size={20} color="#F07167" />
          </div>
          <div>
            <div style={{ fontSize:16, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff' }}>Or describe a call</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)' }}>Type what the caller said</div>
          </div>
        </div>
        <textarea rows={4} placeholder="e.g. Someone called saying I owe money to the IRS and need to pay with gift cards right now…" value={text} onChange={(e) => setText(e.target.value)} style={{ resize:'none', marginBottom:14, fontSize:14, lineHeight:1.65 }} />
        <button className="btn-primary" onClick={handleCheck} disabled={analyzing || !text.trim()} style={{ width:'100%', fontSize:15, padding:16 }}>
          {analyzing ? 'Checking…' : '🔍  Check this call'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="fade-up" style={{
          background: result.is_scam ? 'rgba(240,113,103,0.12)' : 'rgba(82,183,136,0.12)',
          backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
          border:`1px solid ${result.is_scam ? 'rgba(240,113,103,0.3)' : 'rgba(82,183,136,0.3)'}`,
          borderRadius:24, padding:20,
          boxShadow:`0 8px 32px ${result.is_scam ? 'rgba(240,113,103,0.2)' : 'rgba(82,183,136,0.2)'}`,
        }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:16, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              {result.is_scam ? <AlertTriangle size={26} color="#F07167" /> : <CheckCircle size={26} color="#52B788" />}
            </div>
            <div>
              <div style={{ fontSize:17, fontFamily:'Nunito,sans-serif', fontWeight:800, color: result.is_scam ? '#F07167' : '#52B788' }}>
                {result.is_scam ? `⚠️ Likely a scam (${result.confidence}% confident)` : '✅ Looks legitimate'}
              </div>
              {result.is_scam && <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:2 }}>{result.scam_type}</div>}
            </div>
          </div>
          <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7, marginBottom:12 }}>{result.explanation}</p>
          <div style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'12px 16px' }}>
            <p style={{ fontSize:14, fontWeight:700, color:'#fff' }}>👉 {result.action}</p>
          </div>
        </div>
      )}

      {/* Scam alerts */}
      {alerts.length > 0 && (
        <>
          <div className="section-header" style={{ marginBottom:4 }}>
            <div className="section-title">⚠️ Active Alerts</div>
            <span style={{ fontSize:12, background:'rgba(240,113,103,0.2)', color:'#F07167', padding:'3px 10px', borderRadius:99, fontWeight:700, border:'1px solid rgba(240,113,103,0.3)' }}>{alerts.length} live</span>
          </div>
          {alerts.map((a, i) => (
            <div key={i} className="alert-card" onClick={() => setExpanded(expanded===i?null:i)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div className="alert-card-title">{a.title}</div>
                {expanded===i ? <ChevronUp size={16} color="rgba(255,255,255,0.4)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.4)" />}
              </div>
              <div className="alert-card-desc">{a.description?.slice(0,90)}…</div>
              {expanded===i && (
                <div className="alert-detail fade-up">
                  <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.4)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.5px' }}>Red flags</p>
                  {a.red_flags?.map((f,j) => <div key={j} className="red-flag-item"><span style={{ color:'#F07167' }}>•</span>{f}</div>)}
                  <div className="how-respond"><Shield size={13} style={{ flexShrink:0 }} />{a.how_to_respond}</div>
                </div>
              )}
            </div>
          ))}
        </>
      )}

      <div style={G.tip}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--teal)', marginBottom:5 }}>🛡️ Remember</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.7)', lineHeight:1.7 }}>The government will <strong>never</strong> call asking for gift cards or wire transfers. When in doubt — hang up!</p>
      </div>
    </div>
  );
}

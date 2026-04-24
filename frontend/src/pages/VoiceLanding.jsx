import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, ArrowRight } from 'lucide-react';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const AGENT_ID = import.meta.env.VITE_VAPI_SCAM_AGENT_ID;

// Detect which of the 4 tabs to open based on what the user said
function detectIntent(text) {
  const t = text.toLowerCase();
  if (t.match(/scam|fraud|suspicious|irs|social security|medicare|fake|stolen|cheat|trick|crime|police|warning|danger/))
    return 'scam';
  if (t.match(/remind|task|todo|appointment|medication|medicine|remember|schedule|list|checkup|pill|doctor visit|meet/))
    return 'todo';
  if (t.match(/cab|taxi|food|order|restaurant|ticket|travel|train|flight|book|ride|bus|hotel|pizza|delivery|trip|journey/))
    return 'help';
  if (t.match(/doctor|medical|health|bank|banking|insurance|money|hospital|prescription|account|loan|payment|invest|nurse/))
    return 'ask';
  return null;
}

const STATES = {
  idle:       { label: 'Tap the mic to speak',  color: 'var(--teal)' },
  connecting: { label: 'Getting ready…',         color: 'var(--blue)' },
  listening:  { label: "I'm listening…",         color: 'var(--teal)' },
  thinking:   { label: 'Got it! Taking you…',   color: 'var(--green)' },
};

export default function VoiceLanding({ onRouted }) {
  const [state, setState] = useState('idle'); // idle | connecting | listening | thinking
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume] = useState(0);
  const [detectedTab, setDetectedTab] = useState(null);
  const vapiRef = useRef(null);
  const intentRef = useRef(null);

  const cleanup = useCallback(() => {
    try { vapiRef.current?.stop?.(); } catch (_) {}
    vapiRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startListening = useCallback(async () => {
    if (state !== 'idle') return;
    setState('connecting');
    setTranscript('');
    setDetectedTab(null);
    intentRef.current = null;

    try {
      const { default: Vapi } = await import('@vapi-ai/web');
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setState('listening'));

      vapi.on('volume-level', (v) => setVolume(v));

      vapi.on('message', (msg) => {
        if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.role === 'user') {
          const text = msg.transcript;
          setTranscript(text);
          const intent = detectIntent(text);
          if (intent && !intentRef.current) {
            intentRef.current = intent;
            setDetectedTab(intent);
          }
        }
      });

      vapi.on('call-end', () => {
        setState('thinking');
        const tab = intentRef.current || 'scam';
        setTimeout(() => onRouted(tab), 1800);
      });

      vapi.on('error', () => {
        cleanup();
        setState('idle');
      });

      // If no VAPI agent, fall back to demo mode
      if (!AGENT_ID) {
        setState('listening');
        setTimeout(() => {
          setTranscript('I am worried about a suspicious phone call I received.');
          setDetectedTab('scam');
          intentRef.current = 'scam';
          setState('thinking');
          setTimeout(() => onRouted('scam'), 1800);
        }, 2000);
        return;
      }

      await vapi.start(AGENT_ID);
    } catch (err) {
      console.error('[Groove] Mic error:', err);
      cleanup();
      setState('idle');
    }
  }, [state, onRouted, cleanup]);

  const stopListening = useCallback(() => {
    cleanup();
    setState('thinking');
    const tab = intentRef.current || 'scam';
    setDetectedTab(tab);
    setTimeout(() => onRouted(tab), 1500);
  }, [cleanup, onRouted]);

  const isActive  = state === 'listening';
  const isBusy    = state === 'connecting' || state === 'thinking';
  const statusInfo = STATES[state] || STATES.idle;

  const TAB_LABELS = { scam: 'Scam Guard', todo: 'To-Do List', help: 'Help Me', ask: 'Ask Away' };
  const TAB_COLORS = { scam: 'var(--coral)', todo: 'var(--amber)', help: 'var(--green)', ask: 'var(--blue)' };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'linear-gradient(170deg, #E4F7F7 0%, #F0F7F8 40%, #EAF4FB 100%)',
      padding: '0 24px 40px',
    }}>

      {/* Top branding */}
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 22,
          background: 'linear-gradient(135deg, var(--teal), var(--blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 8px 24px rgba(59,191,191,0.35)',
        }}>
          <Mic size={32} color="#fff" />
        </div>
        <h1 style={{
          fontFamily: 'Nunito, sans-serif', fontWeight: 900,
          fontSize: 40, color: 'var(--text-primary)', letterSpacing: -1,
        }}>
          Groove
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginTop: 6, fontWeight: 500 }}>
          Your friendly helper
        </p>
      </div>

      {/* Center — mic orb */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, flex: 1, justifyContent: 'center' }}>

        {/* Orb */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isActive && (
            <>
              <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', border:'3px solid var(--teal)', animation:'orbPulse 2s ease-out infinite', opacity:0.5 }} />
              <div style={{ position:'absolute', width:160, height:160, borderRadius:'50%', border:'3px solid var(--teal)', animation:'orbPulse 2s ease-out 0.7s infinite', opacity:0.3 }} />
            </>
          )}
          <button
            onClick={isActive ? stopListening : startListening}
            disabled={isBusy}
            style={{
              width: 150, height: 150, borderRadius: '50%', border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, var(--coral) 0%, #E05A52 100%)'
                : isBusy
                  ? 'linear-gradient(135deg, #A8D8D8 0%, #8BBCC8 100%)'
                  : 'linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isBusy ? 'default' : 'pointer',
              boxShadow: isActive
                ? '0 12px 40px rgba(240,113,103,0.45)'
                : '0 12px 40px rgba(59,191,191,0.45)',
              transition: 'all 0.3s',
              position: 'relative', zIndex: 1,
            }}
          >
            {isBusy
              ? <div style={{ width:44, height:44, border:'4px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
              : isActive
                ? <MicOff size={56} color="#fff" />
                : <Mic size={56} color="#fff" />
            }
          </button>
        </div>

        {/* Waveform when listening */}
        {isActive && (
          <div style={{ display:'flex', gap:5, alignItems:'center', height:36 }}>
            {[1,2,3,4,5,6,7].map((i) => (
              <div key={i} style={{
                width: 5, borderRadius: 3,
                background: 'var(--teal)',
                height: `${12 + volume * 28}px`,
                animation: `wave 0.9s ease-in-out ${i*0.1}s infinite`,
              }} />
            ))}
          </div>
        )}

        {/* Status text */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'Nunito, sans-serif', fontWeight: 800,
            fontSize: 22, color: statusInfo.color, marginBottom: 8,
          }}>
            {statusInfo.label}
          </p>

          {/* Transcript bubble */}
          {transcript ? (
            <div style={{
              background: '#fff', borderRadius: 20, padding: '14px 20px',
              maxWidth: 300, boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{transcript}"
              </p>
              {detectedTab && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <ArrowRight size={14} color={TAB_COLORS[detectedTab]} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: TAB_COLORS[detectedTab] }}>
                    Opening {TAB_LABELS[detectedTab]}…
                  </span>
                </div>
              )}
            </div>
          ) : (
            <p style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260, textAlign: 'center' }}>
              {state === 'idle'
                ? 'Speak naturally — Groove will\nlisten and take you to the right place'
                : state === 'listening'
                  ? 'Tell me what you need help with\ntoday — take your time'
                  : ''}
            </p>
          )}
        </div>
      </div>

      {/* Bottom — skip link */}
      <button
        onClick={() => onRouted('scam')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 15, color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif',
          fontWeight: 500, padding: '10px 20px', borderRadius: 99,
          textDecoration: 'underline', textDecorationColor: 'transparent',
        }}
        onMouseEnter={e => e.target.style.color = 'var(--teal)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
      >
        Skip — go straight to the menu
      </button>
    </div>
  );
}

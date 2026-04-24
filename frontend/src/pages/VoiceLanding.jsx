import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, ArrowRight, Shield, CheckSquare, HelpCircle, MessageCircle } from 'lucide-react';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;

// ── Intent detection — runs on every word the user says ──────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();

  // Scam / fraud
  if (t.match(/scam|fraud|suspicious|irs|social security|medicare|fake|stolen|cheat|trick|crime|police|warning|danger|suspicious call|robocall|phishing|identity theft/))
    return 'scam';

  // Reminders / to-do
  if (t.match(/remind|reminder|task|to.?do|appointment|medication|medicine|remember|schedule|list|checkup|pill|tablet|drug|alarm|alert|notify|take my|set a reminder|add a reminder|add reminder/))
    return 'todo';

  // Cab / food / travel
  if (t.match(/cab|taxi|food|order|restaurant|ticket|travel|train|flight|book|ride|bus|hotel|pizza|delivery|trip|journey|uber|lyft|airport|station|eat|lunch|dinner|breakfast/))
    return 'help';

  // Medical / banking
  if (t.match(/doctor|medical|health|bank|banking|insurance|money|hospital|prescription|account|loan|payment|invest|nurse|blood pressure|diabetes|sugar|cholesterol|symptom|pain|ache|finance|credit/))
    return 'ask';

  return null;
}

const TAB_INFO = {
  scam: { label: 'Scam Guard',   color: '#F07167', bg: '#FEF0EF', icon: Shield },
  todo: { label: 'To-Do List',  color: '#F4A261', bg: '#FEF5EC', icon: CheckSquare },
  help: { label: 'Help Me',     color: '#52B788', bg: '#EBF7F2', icon: HelpCircle },
  ask:  { label: 'Ask Away',    color: '#5BA4CF', bg: '#EAF4FB', icon: MessageCircle },
};

// Neutral routing assistant — doesn't talk about scams, just listens and acknowledges
const ROUTING_ASSISTANT = {
  name: 'Groove Router',
  model: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
    systemPrompt: `You are Groove, a warm and friendly voice assistant for elderly people.
Your ONLY job right now is to listen to what the user needs and say ONE short, warm sentence acknowledging it.
Do NOT give advice. Do NOT answer questions. Do NOT explain anything.
Just say something like: "Got it, I'll take you there right away!" or "Of course, let me open that for you!"
Then stay silent. Keep it under 10 words.`,
  },
  voice: { provider: '11labs', voiceId: 'pNInz6obpgDQGcFmaJgB' },
  firstMessage: 'Hello! I\'m Groove. What can I help you with today?',
  transcriber: { provider: 'deepgram', model: 'nova-3', language: 'en' },
};

export default function VoiceLanding({ onRouted }) {
  const [state, setState]           = useState('idle');
  const [transcript, setTranscript] = useState('');
  const [volume, setVolume]         = useState(0);
  const [detectedTab, setDetectedTab] = useState(null);
  const vapiRef    = useRef(null);
  const intentRef  = useRef(null);
  const routedRef  = useRef(false);

  const cleanup = useCallback(() => {
    try { vapiRef.current?.stop?.(); } catch (_) {}
    vapiRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  // ── Route immediately — called the moment intent is detected ─────────────
  const routeTo = useCallback((tab) => {
    if (routedRef.current) return;
    routedRef.current = true;
    intentRef.current = tab;
    setDetectedTab(tab);
    setState('thinking');
    // Give the user 1.2s to see the "Taking you to X" message, then navigate
    setTimeout(() => {
      cleanup();
      onRouted(tab);
    }, 1200);
  }, [cleanup, onRouted]);

  const startListening = useCallback(async () => {
    if (state !== 'idle') return;
    setState('connecting');
    setTranscript('');
    setDetectedTab(null);
    intentRef.current  = null;
    routedRef.current  = false;

    try {
      const { default: Vapi } = await import('@vapi-ai/web');
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on('call-start', () => setState('listening'));
      vapi.on('volume-level', (v) => setVolume(v));

      vapi.on('message', (msg) => {
        // Only act on user's final speech, not assistant responses
        if (msg.type === 'transcript' && msg.transcriptType === 'final' && msg.role === 'user') {
          const text = msg.transcript;
          setTranscript(text);

          const intent = detectIntent(text);
          if (intent) {
            // ✅ Route immediately — don't wait for call to end
            routeTo(intent);
          }
        }
      });

      // If call ends without detecting intent, show all tabs (home)
      vapi.on('call-end', () => {
        if (!routedRef.current) {
          setState('thinking');
          setTimeout(() => onRouted('scam'), 1000);
        }
      });

      vapi.on('error', () => { cleanup(); setState('idle'); });

      // Start with the neutral routing assistant
      await vapi.start(ROUTING_ASSISTANT);

    } catch (err) {
      console.error('[Groove]', err);
      // Demo fallback — no VAPI key
      setState('listening');
      setTimeout(() => {
        const demo = 'I want to set a reminder for my medication';
        setTranscript(demo);
        routeTo(detectIntent(demo) || 'todo');
      }, 2500);
    }
  }, [state, onRouted, routeTo]);

  const stopListening = useCallback(() => {
    routeTo(intentRef.current || 'scam');
  }, [routeTo]);

  const isActive = state === 'listening';
  const isBusy   = state === 'connecting' || state === 'thinking';

  const statusLabel = {
    idle:       'Tap the mic and speak',
    connecting: 'Getting ready…',
    listening:  "I'm listening… speak freely",
    thinking:   detectedTab ? `Opening ${TAB_INFO[detectedTab]?.label}…` : 'Got it!',
  }[state];

  const statusColor = {
    idle: 'var(--teal)', connecting: 'var(--blue)',
    listening: 'var(--teal)', thinking: 'var(--green)',
  }[state];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px 40px',
    }}>

      {/* Branding */}
      <div style={{ textAlign: 'center', paddingTop: 56 }}>
        <div style={{
          width: 68, height: 68, borderRadius: 22,
          background: 'linear-gradient(135deg,var(--teal),var(--blue))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 8px 24px rgba(59,191,191,0.35)',
        }}>
          <Mic size={34} color="#fff" />
        </div>
        <h1 style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:42, color:'var(--text-primary)', letterSpacing:-1 }}>
          Groove
        </h1>
        <p style={{ fontSize:16, color:'var(--text-secondary)', marginTop:4, fontWeight:500 }}>
          Your friendly helper
        </p>
      </div>

      {/* Mic + status */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:28, flex:1, justifyContent:'center' }}>

        {/* Orb */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {isActive && (
            <>
              <div style={{ position:'absolute', width:170, height:170, borderRadius:'50%', border:'3px solid var(--teal)', animation:'orbPulse 2s ease-out infinite', opacity:0.5 }} />
              <div style={{ position:'absolute', width:170, height:170, borderRadius:'50%', border:'3px solid var(--teal)', animation:'orbPulse 2s ease-out 0.75s infinite', opacity:0.3 }} />
            </>
          )}
          <button
            onClick={isActive ? stopListening : startListening}
            disabled={isBusy}
            style={{
              width:155, height:155, borderRadius:'50%', border:'none',
              background: isActive
                ? 'linear-gradient(135deg,var(--coral),#E05A52)'
                : isBusy
                  ? 'linear-gradient(135deg,#A8D8D8,#8BBCC8)'
                  : 'linear-gradient(135deg,var(--teal),var(--blue))',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor: isBusy ? 'default' : 'pointer',
              boxShadow: isActive ? '0 12px 40px rgba(240,113,103,0.45)' : '0 12px 40px rgba(59,191,191,0.45)',
              transition:'all 0.3s', position:'relative', zIndex:1,
            }}
          >
            {isBusy
              ? <div style={{ width:46, height:46, border:'4px solid rgba(255,255,255,0.35)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
              : isActive ? <MicOff size={58} color="#fff" /> : <Mic size={58} color="#fff" />
            }
          </button>
        </div>

        {/* Waveform */}
        {isActive && (
          <div style={{ display:'flex', gap:5, alignItems:'center', height:38 }}>
            {[1,2,3,4,5,6,7].map((i) => (
              <div key={i} style={{ width:5, borderRadius:3, background:'var(--teal)', height:`${12+volume*28}px`, animation:`wave 0.9s ease-in-out ${i*0.1}s infinite` }} />
            ))}
          </div>
        )}

        {/* Status */}
        <div style={{ textAlign:'center', maxWidth:300 }}>
          <p style={{ fontFamily:'Nunito,sans-serif', fontWeight:800, fontSize:22, color:statusColor, marginBottom:10 }}>
            {statusLabel}
          </p>

          {/* Transcript bubble */}
          {transcript ? (
            <div className="fade-up glass" style={{ borderRadius:20, padding:'16px 20px' }}>
              <p style={{ fontSize:15, color:'var(--text-primary)', lineHeight:1.65, fontStyle:'italic' }}>
                "{transcript}"
              </p>
              {detectedTab && (() => {
                const info = TAB_INFO[detectedTab];
                const Icon = info.icon;
                return (
                  <div style={{ marginTop:12, display:'flex', alignItems:'center', gap:8, justifyContent:'center', background:info.bg, borderRadius:12, padding:'8px 14px' }}>
                    <Icon size={16} color={info.color} />
                    <span style={{ fontSize:14, fontWeight:700, color:info.color }}>
                      Opening {info.label}…
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p style={{ fontSize:15, color:'var(--text-muted)', lineHeight:1.75 }}>
              {state === 'idle'
                ? 'Say what you need — Groove listens and takes you to the right place automatically'
                : state === 'listening'
                  ? 'Take your time. You can say anything like:\n"Remind me to take my pill" or "I got a suspicious call"'
                  : ''}
            </p>

          )}
        </div>

        {/* Hint chips — shown only when idle */}
        {state === 'idle' && (
          <div className="fade-up" style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center', maxWidth:320 }}>
            {[
              { text:'"Remind me to take my pill"',  tab:'todo', icon:CheckSquare },
              { text:'"I got a suspicious call"',    tab:'scam', icon:Shield },
              { text:'"Book me a cab"',              tab:'help', icon:HelpCircle },
              { text:'"I have a question for my doctor"', tab:'ask', icon:MessageCircle },
            ].map(({ text, tab, icon: Icon }) => {
              const info = TAB_INFO[tab];
              return (
                <button
                  key={text}
                  onClick={() => routeTo(tab)}
                  style={{
                    display:'flex', alignItems:'center', gap:6,
                    padding:'8px 14px', borderRadius:99,
                    background:info.bg, border:`1.5px solid ${info.color}22`,
                    fontSize:12, fontWeight:600, color:info.color,
                    cursor:'pointer', fontFamily:'Poppins,sans-serif',
                    transition:'all 0.15s',
                  }}
                >
                  <Icon size={13} />
                  {text}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Skip */}
      <button
        onClick={() => onRouted('scam')}
        style={{ background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--text-muted)', fontFamily:'Poppins,sans-serif', fontWeight:500, padding:'10px 20px' }}
      >
        Skip — go straight to the menu
      </button>
    </div>
  );
}

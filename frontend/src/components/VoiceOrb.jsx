import { Phone, PhoneOff, Mic, MicOff, Shield, Calendar, BookOpen } from 'lucide-react';

const AGENTS = [
  { id: 'scam',      label: 'Scam Guard',    icon: Shield,   color: '#F07167', bg: '#FEF0EF' },
  { id: 'scheduler', label: 'Book Appt',     icon: Calendar, color: '#52B788', bg: '#EBF7F2' },
  { id: 'educator',  label: 'Learn AI',      icon: BookOpen, color: '#5BA4CF', bg: '#EAF4FB' },
];

export default function VoiceOrb({ callState, activeAgent, selectedAgent, setSelectedAgent, isMuted, volumeLevel, onStart, onEnd, onMute }) {
  const isActive = callState === 'active';
  const isConnecting = callState === 'connecting';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

      {/* Agent selector */}
      {callState === 'idle' && (
        <div className="agent-pills">
          {AGENTS.map((a) => {
            const Icon = a.icon;
            const sel = selectedAgent === a.id;
            return (
              <button key={a.id} className={`agent-pill${sel ? ' active' : ''}`} onClick={() => setSelectedAgent(a.id)}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={14} color={a.color} />
                </div>
                {a.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Orb */}
      <div className="orb-container" style={{ width: 180, height: 180 }}>
        {isActive && (
          <>
            <div className="orb-ring" style={{ width: 140, height: 140, animationDelay: '0s' }} />
            <div className="orb-ring" style={{ width: 140, height: 140, animationDelay: '0.7s' }} />
          </>
        )}
        <button
          className={`orb-btn${isActive ? ' active' : ''}`}
          onClick={isActive ? onEnd : () => onStart(selectedAgent)}
          disabled={isConnecting}
        >
          {isConnecting
            ? <div style={{ width: 32, height: 32, border: '3px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            : isActive
              ? <PhoneOff size={40} color="#fff" />
              : <Phone size={40} color="#fff" />
          }
        </button>
      </div>

      {/* Status */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        {callState === 'idle' && (
          <>
            <div className="orb-status">Tap to call</div>
            <div className="orb-sub">{AGENTS.find(a => a.id === selectedAgent)?.label} assistant</div>
          </>
        )}
        {isConnecting && <div className="orb-status" style={{ color: 'var(--text-muted)' }}>Connecting…</div>}
        {isActive && (
          <>
            <div className="orb-status" style={{ color: 'var(--teal)' }}>Connected — listening</div>
            <div className="waveform" style={{ marginTop: 10 }}>
              {[1,2,3,4,5].map((i) => (
                <div key={i} className="wave-bar" style={{ height: `${10 + volumeLevel * 22}px`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </>
        )}
        {callState === 'ended' && <div className="orb-status" style={{ color: 'var(--green)' }}>Call ended. Stay safe!</div>}
      </div>

      {/* Mute */}
      {isActive && (
        <button onClick={onMute} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      )}
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';

const VAPI_PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY || 'demo';

// Agent IDs — set these from your VAPI dashboard or /voice/setup response
const AGENT_IDS = {
  scam: import.meta.env.VITE_VAPI_SCAM_AGENT_ID || null,
  scheduler: import.meta.env.VITE_VAPI_SCHEDULER_AGENT_ID || null,
  educator: import.meta.env.VITE_VAPI_EDUCATOR_AGENT_ID || null,
};

export function useVapi(userId) {
  const [callState, setCallState] = useState('idle'); // idle | connecting | active | ended
  const [transcript, setTranscript] = useState([]);
  const [activeAgent, setActiveAgent] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const vapiRef = useRef(null);

  const initVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current;
    const { default: Vapi } = await import('@vapi-ai/web');
    const vapi = new Vapi(VAPI_PUBLIC_KEY);

    vapi.on('call-start', () => setCallState('active'));
    vapi.on('call-end', () => { setCallState('ended'); setTimeout(() => setCallState('idle'), 2000); });
    vapi.on('speech-start', () => {});
    vapi.on('speech-end', () => {});
    vapi.on('volume-level', (v) => setVolumeLevel(v));
    vapi.on('message', (msg) => {
      if (msg.type === 'transcript' && msg.transcriptType === 'final') {
        setTranscript((prev) => [...prev, { role: msg.role, text: msg.transcript, ts: Date.now() }]);
      }
    });
    vapi.on('error', (err) => {
      console.error('[VAPI]', err);
      setCallState('idle');
    });

    vapiRef.current = vapi;
    return vapi;
  }, []);

  const startCall = useCallback(async (agentType = 'scam') => {
    setCallState('connecting');
    setTranscript([]);
    setActiveAgent(agentType);

    const agentId = AGENT_IDS[agentType];
    if (!agentId) {
      // Demo mode — simulate a call
      setCallState('active');
      setTimeout(() => {
        setTranscript([{
          role: 'assistant',
          text: "Hello! I'm GuardianVoice. I'm here to help keep you safe and assist with your daily needs. How can I help you today?",
          ts: Date.now(),
        }]);
      }, 1000);
      return;
    }

    try {
      const vapi = await initVapi();
      await vapi.start(agentId, { metadata: { userId } });
    } catch (err) {
      console.error('[VAPI] Start failed:', err);
      setCallState('idle');
    }
  }, [initVapi, userId]);

  const endCall = useCallback(async () => {
    if (vapiRef.current) {
      await vapiRef.current.stop();
    }
    setCallState('ended');
    setActiveAgent(null);
    setTimeout(() => setCallState('idle'), 1500);
  }, []);

  const toggleMute = useCallback(() => {
    if (vapiRef.current) {
      vapiRef.current.setMuted(!isMuted);
      setIsMuted((m) => !m);
    }
  }, [isMuted]);

  return { callState, transcript, activeAgent, isMuted, volumeLevel, startCall, endCall, toggleMute };
}

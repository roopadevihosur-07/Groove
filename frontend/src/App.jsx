import { useState } from 'react';
import VoiceLanding from './pages/VoiceLanding';
import MainTabs from './pages/MainTabs';
import './App.css';

export default function App() {
  const [phase, setPhase]     = useState('voice');
  const [startTab, setStartTab] = useState('scam');

  const handleRouted = (tab) => { setStartTab(tab); setPhase('main'); };

  return (
    <>
      {/* Fixed background */}
      <div className="app-bg" />
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />
      <div className="bg-orb bg-orb-3" />

      <div className="app-root">
        {phase === 'voice'
          ? <VoiceLanding onRouted={handleRouted} />
          : <MainTabs initialTab={startTab} onBack={() => setPhase('voice')} />
        }
      </div>
    </>
  );
}

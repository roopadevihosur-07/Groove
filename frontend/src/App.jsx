import { useState } from 'react';
import VoiceLanding from './pages/VoiceLanding';
import MainTabs from './pages/MainTabs';
import './App.css';

export default function App() {
  const [phase, setPhase] = useState('voice'); // 'voice' | 'main'
  const [startTab, setStartTab] = useState('scam');

  const handleRouted = (tab) => {
    setStartTab(tab);
    setPhase('main');
  };

  return (
    <div className="app-root">
      {phase === 'voice'
        ? <VoiceLanding onRouted={handleRouted} />
        : <MainTabs initialTab={startTab} onBack={() => setPhase('voice')} />
      }
    </div>
  );
}

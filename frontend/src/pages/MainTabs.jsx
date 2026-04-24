import { useState } from 'react';
import { Shield, CheckSquare, HelpCircle, MessageCircle, Mic } from 'lucide-react';
import ScamProtection from './tabs/ScamProtection';
import ToDoList from './tabs/ToDoList';
import HelpMe from './tabs/HelpMe';
import AskQuestion from './tabs/AskQuestion';

const TABS = [
  {
    id: 'scam',
    label: 'Scam Guard',
    icon: Shield,
    color: '#F07167',
    bg: '#FEF0EF',
    activeColor: '#F07167',
  },
  {
    id: 'todo',
    label: 'To-Do List',
    icon: CheckSquare,
    color: '#F4A261',
    bg: '#FEF5EC',
    activeColor: '#F4A261',
  },
  {
    id: 'help',
    label: 'Help Me',
    icon: HelpCircle,
    color: '#52B788',
    bg: '#EBF7F2',
    activeColor: '#52B788',
  },
  {
    id: 'ask',
    label: 'Ask Away',
    icon: MessageCircle,
    color: '#5BA4CF',
    bg: '#EAF4FB',
    activeColor: '#5BA4CF',
  },
];

export default function MainTabs({ initialTab = 'scam', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>

      {/* Top bar */}
      <div style={{
        background: 'linear-gradient(135deg, var(--teal) 0%, var(--blue) 100%)',
        padding: '16px 20px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'rgba(255,255,255,0.2)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
          title="Back to mic"
        >
          <Mic size={20} color="#fff" />
        </button>
        <div>
          <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:22, color:'#fff', letterSpacing:-0.5 }}>
            Groove
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>
            How can I help you today?
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ paddingTop: 4 }}>
        {activeTab === 'scam' && <ScamProtection />}
        {activeTab === 'todo' && <ToDoList />}
        {activeTab === 'help' && <HelpMe />}
        {activeTab === 'ask'  && <AskQuestion />}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav">
        {TABS.map(({ id, label, icon: Icon, color, bg }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              className={`nav-item${isActive ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
              style={{ color: isActive ? color : 'var(--text-muted)' }}
            >
              <div className="nav-icon-wrap" style={{ background: isActive ? bg : 'transparent' }}>
                <Icon size={22} color={isActive ? color : 'var(--text-muted)'} />
              </div>
              <span style={{ fontWeight: isActive ? 700 : 500 }}>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

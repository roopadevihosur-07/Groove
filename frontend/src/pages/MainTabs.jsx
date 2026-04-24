import { useState } from 'react';
import { Shield, CheckSquare, HelpCircle, MessageCircle, Mic, LayoutDashboard } from 'lucide-react';
import ScamProtection from './tabs/ScamProtection';
import ToDoList from './tabs/ToDoList';
import HelpMe from './tabs/HelpMe';
import AskQuestion from './tabs/AskQuestion';
import FamilyDashboard from './FamilyDashboard';

const TABS = [
  { id: 'scam',      label: 'Scam Guard', icon: Shield,           color: '#F07167', bg: '#FEF0EF' },
  { id: 'todo',      label: 'To-Do',      icon: CheckSquare,      color: '#F4A261', bg: '#FEF5EC' },
  { id: 'help',      label: 'Help Me',    icon: HelpCircle,       color: '#52B788', bg: '#EBF7F2' },
  { id: 'ask',       label: 'Ask Away',   icon: MessageCircle,    color: '#5BA4CF', bg: '#EAF4FB' },
  { id: 'dashboard', label: 'Dashboard',  icon: LayoutDashboard,  color: '#9B8EC4', bg: '#F2F0FA' },
];

export default function MainTabs({ initialTab = 'scam', onBack }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const current = TABS.find((t) => t.id === activeTab) || TABS[0];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 88 }}>

      {/* Top bar */}
      <div style={{
        background: 'rgba(10,25,40,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        padding: '16px 20px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 4px 30px rgba(0,0,0,0.3)',
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
        {activeTab === 'scam'      && <ScamProtection />}
        {activeTab === 'todo'      && <ToDoList />}
        {activeTab === 'help'      && <HelpMe />}
        {activeTab === 'ask'       && <AskQuestion />}
        {activeTab === 'dashboard' && <FamilyDashboard />}
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

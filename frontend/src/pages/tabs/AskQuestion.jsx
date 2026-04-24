import { useState } from 'react';
import { MessageCircle, Stethoscope, Building2, ArrowLeft, Send, BookOpen } from 'lucide-react';
import { queryKnowledge } from '../../lib/api';

const CATEGORIES = [
  {
    id: 'medical',
    label: 'Medical Questions',
    icon: Stethoscope,
    color: '#F07167',
    bg: '#FEF0EF',
    description: 'Ask about medicines, symptoms, doctors, and health',
    placeholder: 'e.g. What does high blood pressure mean? When should I see a doctor? How do I take metformin?',
    quickQ: [
      'What is high blood pressure?',
      'How do I manage diabetes?',
      'When should I call a doctor?',
      'What are the side effects of aspirin?',
    ],
  },
  {
    id: 'banking',
    label: 'Banking Help',
    icon: Building2,
    color: '#5BA4CF',
    bg: '#EAF4FB',
    description: 'Questions about your bank, payments, and money',
    placeholder: 'e.g. How do I check my balance? What is a debit card? How do I send money to my family?',
    quickQ: [
      'How do I check my balance?',
      'What is a debit vs credit card?',
      'How do I send money safely?',
      'What if I forget my PIN?',
    ],
  },
];

export default function AskQuestion() {
  const [selected, setSelected] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [askedQ, setAskedQ] = useState('');

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    setAskedQ(query);
    try {
      const data = await queryKnowledge(query);
      setAnswer(data.result || "I'm sorry, I couldn't find that right now. Please ask again or call your doctor/bank directly.");
    } catch (_) {
      setAnswer("I'm having trouble answering right now. Please try again in a moment.");
    }
    setLoading(false);
  };

  if (selected) {
    const cat = CATEGORIES.find((c) => c.id === selected);
    const Icon = cat.icon;
    return (
      <div style={{ paddingBottom: 20 }} className="fade-up">
        {/* Back */}
        <div style={{ padding:'20px 20px 0' }}>
          <button
            onClick={() => { setSelected(null); setAnswer(null); setQuestion(''); }}
            style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',fontSize:15,color:'var(--text-secondary)',fontFamily:'Poppins,sans-serif',fontWeight:500,padding:0 }}
          >
            <ArrowLeft size={18} /> Back to Ask Away
          </button>
        </div>

        {/* Header */}
        <div style={{ margin:'16px 20px 0',background:`linear-gradient(135deg,${cat.color},${cat.color}CC)`,borderRadius:'var(--radius-lg)',padding:22,color:'#fff',boxShadow:`0 8px 28px ${cat.color}55` }}>
          <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:10 }}>
            <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Icon size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>{cat.label}</div>
              <div style={{ fontSize:13,opacity:0.85 }}>{cat.description}</div>
            </div>
          </div>
        </div>

        {/* Quick questions */}
        <div style={{ margin:'16px 20px 0' }}>
          <p style={{ fontSize:16,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)',marginBottom:10 }}>Common questions — tap to ask:</p>
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            {cat.quickQ.map((q) => (
              <button
                key={q}
                onClick={() => { setQuestion(q); handleAsk(q); }}
                style={{
                  background:'#fff',borderRadius:14,padding:'14px 18px',border:'2px solid var(--border)',
                  fontSize:15,fontFamily:'Poppins,sans-serif',fontWeight:500,color:'var(--text-primary)',
                  cursor:'pointer',textAlign:'left',display:'flex',alignItems:'center',gap:10,
                  boxShadow:'var(--shadow-sm)',transition:'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=cat.color; e.currentTarget.style.background=cat.bg; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='#fff'; }}
              >
                <span style={{ fontSize:18 }}>❓</span> {q}
              </button>
            ))}
          </div>
        </div>

        {/* Type your own */}
        <div style={{ margin:'16px 20px 0',background:'#fff',borderRadius:'var(--radius-lg)',padding:20,boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:16,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)',marginBottom:12 }}>Or type your own question:</p>
          <textarea
            rows={3}
            placeholder={cat.placeholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())}
            style={{ resize:'none',marginBottom:12,fontSize:15,lineHeight:1.65 }}
          />
          <button
            className="btn-primary"
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            style={{ width:'100%',fontSize:17,padding:18,display:'flex',alignItems:'center',justifyContent:'center',gap:10 }}
          >
            {loading ? 'Looking that up…' : <><Send size={18} /> Ask Groove</>}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ margin:'16px 20px 0',textAlign:'center',padding:20 }}>
            <div style={{ width:40,height:40,border:'4px solid var(--teal-mid)',borderTopColor:'var(--teal)',borderRadius:'50%',animation:'spin 0.9s linear infinite',margin:'0 auto 12px' }} />
            <p style={{ fontSize:15,color:'var(--text-muted)' }}>Finding your answer…</p>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="fade-up" style={{ margin:'14px 20px 0',background:'#fff',borderRadius:'var(--radius-lg)',padding:22,boxShadow:'var(--shadow-sm)',borderLeft:`5px solid ${cat.color}` }}>
            <div style={{ display:'flex',gap:10,alignItems:'center',marginBottom:14 }}>
              <div style={{ width:42,height:42,borderRadius:13,background:cat.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <BookOpen size={20} color={cat.color} />
              </div>
              <div style={{ fontSize:15,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)' }}>"{askedQ}"</div>
            </div>
            <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.8,whiteSpace:'pre-line' }}>{answer}</p>
            <div style={{ marginTop:16,padding:'12px 16px',background:'var(--teal-light)',borderRadius:12 }}>
              <p style={{ fontSize:13,color:'var(--teal-dark)',fontWeight:600 }}>
                💬 Want to talk about this? Tap the mic button at the top and ask Groove out loud — it's easier!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#5BA4CF,#3A7FB5)', margin:'20px 20px 0', borderRadius:'var(--radius-lg)', padding:22, color:'#fff', boxShadow:'0 8px 28px rgba(91,164,207,0.35)' }}>
        <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:10 }}>
          <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <MessageCircle size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>Ask Away</div>
            <div style={{ fontSize:13,opacity:0.85 }}>Medical & banking questions answered</div>
          </div>
        </div>
        <p style={{ fontSize:14,opacity:0.9,lineHeight:1.65 }}>
          Have a question about your health or bank? Pick a topic below and Groove will give you a simple, clear answer.
        </p>
      </div>

      {/* Category cards */}
      <div style={{ margin:'16px 20px 0',display:'flex',flexDirection:'column',gap:14 }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => { setSelected(cat.id); setAnswer(null); setQuestion(''); }}
              style={{
                background:'#fff',borderRadius:'var(--radius-lg)',padding:'22px 22px',
                display:'flex',alignItems:'center',gap:18,
                border:'none',cursor:'pointer',textAlign:'left',
                boxShadow:'var(--shadow-sm)',transition:'all 0.2s',width:'100%',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='var(--shadow-sm)'}
            >
              <div style={{ width:64,height:64,borderRadius:20,background:cat.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon size={30} color={cat.color} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20,color:'var(--text-primary)',marginBottom:5 }}>{cat.label}</div>
                <div style={{ fontSize:14,color:'var(--text-muted)',lineHeight:1.5 }}>{cat.description}</div>
              </div>
              <div style={{ width:36,height:36,borderRadius:12,background:cat.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <ArrowLeft size={18} color={cat.color} style={{ transform:'rotate(180deg)' }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ margin:'20px 20px 0',background:'var(--blue-light)',borderRadius:'var(--radius-md)',padding:16,border:'1px solid rgba(91,164,207,0.3)' }}>
        <p style={{ fontSize:14,fontWeight:700,color:'var(--blue)',marginBottom:4 }}>🔒 Your privacy matters</p>
        <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>Groove only provides general information. For personal advice, always speak to your doctor or bank directly.</p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { MessageCircle, Stethoscope, Building2, ArrowLeft, ArrowRight, Send, BookOpen } from 'lucide-react';
import { queryKnowledge } from '../../lib/api';

const CATEGORIES = [
  {
    id:'medical', label:'Medical Questions', icon:Stethoscope, color:'#F07167', glow:'rgba(240,113,103,0.2)',
    description:'Medicines, symptoms, doctors, and health',
    placeholder:'e.g. What does high blood pressure mean?',
    quickQ:['What is high blood pressure?','How do I manage diabetes?','When should I call a doctor?','Side effects of aspirin?'],
  },
  {
    id:'banking', label:'Banking Help', icon:Building2, color:'#5BA4CF', glow:'rgba(91,164,207,0.2)',
    description:'Bank, payments, and money questions',
    placeholder:'e.g. How do I check my balance?',
    quickQ:['How do I check my balance?','Debit vs credit card?','How do I send money safely?','What if I forget my PIN?'],
  },
];

const glass = { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:20, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' };

export default function AskQuestion() {
  const [selected, setSelected] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [askedQ, setAskedQ]     = useState('');

  const handleAsk = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setLoading(true); setAnswer(null); setAskedQ(query);
    try {
      const data = await queryKnowledge(query);
      setAnswer(data.result || "I couldn't find that right now. Please ask again.");
    } catch (_) {
      setAnswer("I'm having trouble right now. Please try again in a moment.");
    }
    setLoading(false);
  };

  if (selected) {
    const cat = CATEGORIES.find((c) => c.id === selected);
    const Icon = cat.icon;
    return (
      <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:14 }} className="fade-up">
        <button onClick={() => { setSelected(null); setAnswer(null); setQuestion(''); }} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontSize:15, color:'rgba(255,255,255,0.6)', fontFamily:'Poppins,sans-serif', fontWeight:500, padding:0 }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ background:`linear-gradient(135deg,${cat.glow.replace('0.2','0.25')},${cat.glow.replace('0.2','0.1')})`, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:`1px solid ${cat.color}44`, borderRadius:26, padding:22, boxShadow:`0 8px 32px ${cat.glow}` }}>
          <div style={{ display:'flex', gap:12, alignItems:'center' }}>
            <div style={{ width:50, height:50, borderRadius:16, background:cat.glow, border:`1px solid ${cat.color}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon size={26} color={cat.color} />
            </div>
            <div>
              <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff' }}>{cat.label}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{cat.description}</div>
            </div>
          </div>
        </div>

        {/* Quick questions */}
        <p style={{ fontSize:16, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff', margin:'4px 0 0' }}>Common questions — tap to ask:</p>
        {cat.quickQ.map((q) => (
          <button key={q} onClick={() => { setQuestion(q); handleAsk(q); }} style={{
            background:'rgba(255,255,255,0.06)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)',
            border:`1px solid rgba(255,255,255,0.12)`, borderRadius:16, padding:'14px 18px',
            fontSize:15, fontFamily:'Poppins,sans-serif', fontWeight:500, color:'rgba(255,255,255,0.85)',
            cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:10,
            transition:'all 0.15s', width:'100%',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = cat.glow; e.currentTarget.style.borderColor = `${cat.color}44`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <span style={{ fontSize:16 }}>❓</span> {q}
          </button>
        ))}

        {/* Custom question */}
        <div style={glass}>
          <p style={{ fontSize:15, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff', marginBottom:12 }}>Or type your own question:</p>
          <textarea rows={3} placeholder={cat.placeholder} value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key==='Enter' && !e.shiftKey && (e.preventDefault(), handleAsk())} style={{ resize:'none', marginBottom:12, fontSize:15, lineHeight:1.65 }} />
          <button className="btn-primary" onClick={() => handleAsk()} disabled={loading || !question.trim()} style={{ width:'100%', fontSize:16, padding:16, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            {loading ? 'Looking that up…' : <><Send size={16} /> Ask Groove</>}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign:'center', padding:24 }}>
            <div style={{ width:40, height:40, border:'4px solid rgba(59,191,191,0.3)', borderTopColor:'var(--teal)', borderRadius:'50%', animation:'spin 0.9s linear infinite', margin:'0 auto 12px' }} />
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)' }}>Finding your answer…</p>
          </div>
        )}

        {answer && !loading && (
          <div className="fade-up" style={{ background:`linear-gradient(135deg,${cat.glow.replace('0.2','0.15')},rgba(255,255,255,0.04))`, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:`1px solid ${cat.color}33`, borderRadius:24, padding:22, boxShadow:`0 8px 32px rgba(0,0,0,0.3)` }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
              <div style={{ width:40, height:40, borderRadius:13, background:cat.glow, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <BookOpen size={18} color={cat.color} />
              </div>
              <div style={{ fontSize:14, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff' }}>"{askedQ}"</div>
            </div>
            <p style={{ fontSize:15, color:'rgba(255,255,255,0.8)', lineHeight:1.8, whiteSpace:'pre-line' }}>{answer}</p>
            <div style={{ marginTop:14, background:'rgba(59,191,191,0.1)', border:'1px solid rgba(59,191,191,0.2)', borderRadius:12, padding:'12px 14px' }}>
              <p style={{ fontSize:13, color:'var(--teal)', fontWeight:600 }}>💬 Want to talk about this? Tap the mic button to speak with Groove!</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ background:'linear-gradient(135deg,rgba(91,164,207,0.22),rgba(40,100,170,0.12))', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(91,164,207,0.28)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(91,164,207,0.18)' }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={{ width:50, height:50, borderRadius:16, background:'rgba(91,164,207,0.2)', border:'1px solid rgba(91,164,207,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <MessageCircle size={26} color="#5BA4CF" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff' }}>Ask Away</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Medical & banking help</div>
          </div>
        </div>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>
          Have a question about your health or bank? Pick a topic and Groove gives you a simple, clear answer.
        </p>
      </div>

      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        return (
          <button key={cat.id} onClick={() => { setSelected(cat.id); setAnswer(null); setQuestion(''); }} style={{
            background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:'1px solid rgba(255,255,255,0.12)', borderRadius:24, padding:'22px',
            display:'flex', alignItems:'center', gap:18,
            cursor:'pointer', textAlign:'left', boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
            width:'100%', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = cat.glow; e.currentTarget.style.borderColor = `${cat.color}44`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <div style={{ width:64, height:64, borderRadius:20, background:cat.glow, border:`1px solid ${cat.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={30} color={cat.color} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff', marginBottom:5 }}>{cat.label}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>{cat.description}</div>
            </div>
            <ArrowRight size={20} color="rgba(255,255,255,0.3)" />
          </button>
        );
      })}

      <div style={{ background:'rgba(91,164,207,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(91,164,207,0.2)', borderRadius:20, padding:16 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'#5BA4CF', marginBottom:4 }}>🔒 Your privacy</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>Groove provides general information only. For personal advice, always speak to your doctor or bank directly.</p>
      </div>
    </div>
  );
}

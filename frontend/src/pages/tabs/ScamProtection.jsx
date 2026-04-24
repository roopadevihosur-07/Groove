import { useState, useCallback, useEffect } from 'react';
import { Shield, Phone, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Mic } from 'lucide-react';
import { getDashboard, analyzeCall } from '../../lib/api';

const USER_ID = 'demo-user-001';

export default function ScamProtection() {
  const [suspiciousText, setSuspiciousText] = useState('');
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    getDashboard(USER_ID).then((d) => setAlerts(d.scamAlerts || [])).catch(() => {});
  }, []);

  const handleCheck = async () => {
    if (!suspiciousText.trim()) return;
    setAnalyzing(true);
    setResult(null);
    try {
      const r = await analyzeCall(USER_ID, suspiciousText);
      setResult(r);
    } catch (_) {
      setResult({ is_scam: true, confidence: 70, scam_type: 'Suspicious', explanation: 'This call sounds suspicious. Hang up to be safe.', action: 'Call your family or a trusted friend before doing anything.' });
    }
    setAnalyzing(false);
  };

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Header card */}
      <div style={{ background:'linear-gradient(135deg,#F07167,#E05252)', margin:'20px 20px 0', borderRadius:'var(--radius-lg)', padding:22, color:'#fff', boxShadow:'0 8px 28px rgba(240,113,103,0.35)' }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <Shield size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>Scam Guard</div>
            <div style={{ fontSize:13,opacity:0.85 }}>Protecting you from fraud</div>
          </div>
        </div>
        <p style={{ fontSize:14,opacity:0.9,lineHeight:1.65 }}>
          Got a suspicious call? Describe it below and Groove will check if it's a scam — instantly.
        </p>
      </div>

      {/* Check a call */}
      <div style={{ margin:'16px 20px 0' }}>
        <div style={{ background:'#fff',borderRadius:'var(--radius-lg)',padding:20,boxShadow:'var(--shadow-sm)' }}>
          <div style={{ display:'flex',gap:10,alignItems:'center',marginBottom:14 }}>
            <div style={{ width:44,height:44,borderRadius:14,background:'var(--coral-light)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <Phone size={22} color="var(--coral)" />
            </div>
            <div>
              <div style={{ fontSize:17,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)' }}>Describe the call</div>
              <div style={{ fontSize:13,color:'var(--text-muted)' }}>What did the caller say?</div>
            </div>
          </div>
          <textarea
            rows={4}
            placeholder="For example: Someone called me saying I owe money to the IRS and I need to pay now with gift cards…"
            value={suspiciousText}
            onChange={(e) => setSuspiciousText(e.target.value)}
            style={{ resize:'none', marginBottom:14, fontSize:15, lineHeight:1.65 }}
          />
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={analyzing || !suspiciousText.trim()}
            style={{ width:'100%', fontSize:17, padding:18 }}
          >
            {analyzing ? 'Checking your call…' : '🔍  Check this call'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="fade-up" style={{
            marginTop: 14, borderRadius: 'var(--radius-lg)', padding: 20,
            background: result.is_scam ? 'var(--coral-light)' : 'var(--green-light)',
            border: `1.5px solid ${result.is_scam ? 'rgba(240,113,103,0.3)' : 'rgba(82,183,136,0.3)'}`,
          }}>
            <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:12 }}>
              <div style={{ width:48,height:48,borderRadius:16,background:'rgba(255,255,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                {result.is_scam ? <AlertTriangle size={26} color="var(--coral)" /> : <CheckCircle size={26} color="var(--green)" />}
              </div>
              <div>
                <div style={{ fontSize:17,fontFamily:'Nunito,sans-serif',fontWeight:800,color:result.is_scam?'var(--coral)':'var(--green)' }}>
                  {result.is_scam ? `⚠️ This looks like a scam` : '✅ Seems legitimate'}
                </div>
                {result.is_scam && <div style={{ fontSize:13,color:'var(--text-muted)',marginTop:2 }}>Confidence: {result.confidence}%</div>}
              </div>
            </div>
            <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.7,marginBottom:12 }}>{result.explanation}</p>
            <div style={{ background:'rgba(255,255,255,0.7)',borderRadius:14,padding:'14px 16px' }}>
              <p style={{ fontSize:15,fontWeight:700,color:'var(--text-primary)' }}>👉 What to do: {result.action}</p>
            </div>
          </div>
        )}
      </div>

      {/* Active scam alerts */}
      {alerts.length > 0 && (
        <div style={{ margin:'24px 0 0' }}>
          <div className="section-header">
            <div className="section-title">⚠️ Active Scam Alerts</div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:10,padding:'0 20px' }}>
            {alerts.map((a, i) => (
              <div key={i} className="alert-card" onClick={() => setExpanded(expanded===i?null:i)}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                  <div className="alert-card-title">{a.title}</div>
                  {expanded===i ? <ChevronUp size={16} color="var(--text-muted)"/> : <ChevronDown size={16} color="var(--text-muted)"/>}
                </div>
                <div className="alert-card-desc">{a.description?.slice(0,90)}…</div>
                {expanded===i && (
                  <div className="alert-detail fade-up">
                    <p style={{ fontSize:12,fontWeight:700,color:'var(--text-muted)',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px' }}>Red flags</p>
                    {a.red_flags?.map((f,j) => (
                      <div key={j} className="red-flag-item"><span style={{ color:'var(--coral)',flexShrink:0 }}>•</span>{f}</div>
                    ))}
                    <div className="how-respond"><Shield size={14} style={{ flexShrink:0 }} />{a.how_to_respond}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safety tip */}
      <div style={{ margin:'20px 20px 0',background:'var(--teal-light)',borderRadius:'var(--radius-md)',padding:18,border:'1px solid var(--teal-mid)' }}>
        <p style={{ fontSize:14,fontWeight:700,color:'var(--teal-dark)',marginBottom:6 }}>🛡️  Remember</p>
        <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>
          The government will <strong>never</strong> call you asking for gift cards, wire transfers, or your Social Security number by phone. When in doubt — hang up!
        </p>
      </div>
    </div>
  );
}

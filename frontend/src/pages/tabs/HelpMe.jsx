import { useState } from 'react';
import { HelpCircle, Car, UtensilsCrossed, Plane, ArrowRight, ArrowLeft, PhoneCall } from 'lucide-react';

const SERVICES = [
  {
    id:'cab', label:'Book a Cab', icon:Car, color:'#3BBFBF', glow:'rgba(59,191,191,0.22)',
    description:'Get a taxi or ride anywhere you need',
    steps:['Tell us where you want to go','We find a nearby cab for you','Driver comes to your door'],
    apps:['Uber: 1-800-253-9377','Lyft: 1-855-865-9553','Local taxi: Ask Groove to call'],
  },
  {
    id:'food', label:'Order Food', icon:UtensilsCrossed, color:'#F4A261', glow:'rgba(244,162,97,0.22)',
    description:'Order a meal from your favourite restaurant',
    steps:['Tell us what food you want','We find a restaurant near you','Food arrives at your home'],
    apps:['DoorDash: 1-855-973-1040','Grubhub: 1-877-585-7878','Ask Groove to help order'],
  },
  {
    id:'travel', label:'Travel Tickets', icon:Plane, color:'#9B8EC4', glow:'rgba(155,142,196,0.22)',
    description:'Buy bus, train, or flight tickets',
    steps:['Tell us where and when you want to travel','We find the best options','We help you book the ticket'],
    apps:['Amtrak: 1-800-872-7245','Greyhound: 1-800-231-2222','Airlines: ask Groove'],
  },
];

const glass = { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' };

export default function HelpMe() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const svc = SERVICES.find((s) => s.id === selected);
    const Icon = svc.icon;
    return (
      <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:14 }} className="fade-up">
        <button onClick={() => setSelected(null)} style={{ display:'flex', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer', fontSize:15, color:'rgba(255,255,255,0.6)', fontFamily:'Poppins,sans-serif', fontWeight:500, padding:0 }}>
          <ArrowLeft size={18} /> Back
        </button>

        <div style={{ background:`linear-gradient(135deg,${svc.glow.replace('0.22','0.28')},${svc.glow.replace('0.22','0.12')})`, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:`1px solid ${svc.color}44`, borderRadius:26, padding:22, boxShadow:`0 8px 32px ${svc.glow}` }}>
          <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
            <div style={{ width:50, height:50, borderRadius:16, background:svc.glow, border:`1px solid ${svc.color}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon size={26} color={svc.color} />
            </div>
            <div>
              <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff' }}>{svc.label}</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>{svc.description}</div>
            </div>
          </div>
        </div>

        <div style={glass}>
          <p style={{ fontSize:17, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff', marginBottom:16 }}>How it works</p>
          {svc.steps.map((step, i) => (
            <div key={i} style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
              <div style={{ width:36, height:36, borderRadius:12, background:svc.glow, border:`1px solid ${svc.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:16, color:svc.color }}>
                {i+1}
              </div>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.75)', lineHeight:1.65, paddingTop:6 }}>{step}</p>
            </div>
          ))}
        </div>

        <div style={glass}>
          <p style={{ fontSize:17, fontFamily:'Nunito,sans-serif', fontWeight:800, color:'#fff', marginBottom:14 }}>📞 Helpful numbers</p>
          {svc.apps.map((app, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i < svc.apps.length-1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ width:38, height:38, borderRadius:12, background:svc.glow, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <PhoneCall size={16} color={svc.color} />
              </div>
              <p style={{ fontSize:15, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{app}</p>
            </div>
          ))}
        </div>

        <button className="btn-primary" style={{ width:'100%', fontSize:16, padding:18 }}>
          🎤 &nbsp;{svc.label} with Groove
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding:'20px 20px 0', display:'flex', flexDirection:'column', gap:14 }}>

      <div style={{ background:'linear-gradient(135deg,rgba(82,183,136,0.22),rgba(40,140,90,0.12))', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:'1px solid rgba(82,183,136,0.28)', borderRadius:26, padding:22, boxShadow:'0 8px 32px rgba(82,183,136,0.18)' }}>
        <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:10 }}>
          <div style={{ width:50, height:50, borderRadius:16, background:'rgba(82,183,136,0.2)', border:'1px solid rgba(82,183,136,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <HelpCircle size={26} color="#52B788" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff' }}>Help Me</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)' }}>Cabs, food & travel — made easy</div>
          </div>
        </div>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>
          Need a cab, want food delivered, or booking a trip? Tap a button and Groove guides you step by step.
        </p>
      </div>

      {SERVICES.map((svc) => {
        const Icon = svc.icon;
        return (
          <button key={svc.id} onClick={() => setSelected(svc.id)} style={{
            background:'rgba(255,255,255,0.06)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
            border:`1px solid rgba(255,255,255,0.12)`, borderRadius:24, padding:'20px 22px',
            display:'flex', alignItems:'center', gap:18,
            cursor:'pointer', textAlign:'left', boxShadow:'0 8px 32px rgba(0,0,0,0.25)',
            width:'100%', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = svc.glow; e.currentTarget.style.borderColor = `${svc.color}44`; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            <div style={{ width:64, height:64, borderRadius:20, background:svc.glow, border:`1px solid ${svc.color}44`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <Icon size={30} color={svc.color} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'Nunito,sans-serif', fontWeight:900, fontSize:20, color:'#fff', marginBottom:4 }}>{svc.label}</div>
              <div style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.5 }}>{svc.description}</div>
            </div>
            <ArrowRight size={20} color="rgba(255,255,255,0.3)" />
          </button>
        );
      })}

      <div style={{ background:'rgba(59,191,191,0.08)', backdropFilter:'blur(12px)', WebkitBackdropFilter:'blur(12px)', border:'1px solid rgba(59,191,191,0.2)', borderRadius:20, padding:16 }}>
        <p style={{ fontSize:14, fontWeight:700, color:'var(--teal)', marginBottom:4 }}>💡 Tip</p>
        <p style={{ fontSize:14, color:'rgba(255,255,255,0.65)', lineHeight:1.7 }}>You can also tap the mic and say "Book me a cab" — Groove will take you straight here.</p>
      </div>
    </div>
  );
}

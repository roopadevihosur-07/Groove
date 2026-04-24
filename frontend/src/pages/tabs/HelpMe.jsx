import { useState } from 'react';
import { HelpCircle, Car, UtensilsCrossed, Plane, ArrowLeft, PhoneCall } from 'lucide-react';

const SERVICES = [
  {
    id: 'cab',
    label: 'Book a Cab',
    icon: Car,
    color: '#3BBFBF',
    bg: '#E4F7F7',
    description: 'Get a taxi or ride to anywhere you need to go',
    steps: [
      'Tell us where you want to go',
      'We will find a cab for you nearby',
      'The driver will come to your door',
    ],
    callLabel: 'Book my cab',
    apps: ['Uber: 1-800-253-9377', 'Lyft: 1-855-865-9553', 'Local taxi: Ask Groove to call'],
  },
  {
    id: 'food',
    label: 'Order Food',
    icon: UtensilsCrossed,
    color: '#F4A261',
    bg: '#FEF5EC',
    description: 'Order a meal from your favourite restaurant',
    steps: [
      'Tell us what food you want',
      'We find a restaurant near you',
      'Food arrives at your home',
    ],
    callLabel: 'Order my food',
    apps: ['DoorDash: 1-855-973-1040', 'Grubhub: 1-877-585-7878', 'Ask Groove to help order'],
  },
  {
    id: 'travel',
    label: 'Travel Tickets',
    icon: Plane,
    color: '#9B8EC4',
    bg: '#F2F0FA',
    description: 'Buy bus, train, or flight tickets for your trip',
    steps: [
      'Tell us where and when you want to travel',
      'We find the best options for you',
      'We help you book the ticket',
    ],
    callLabel: 'Book my ticket',
    apps: ['Amtrak: 1-800-872-7245', 'Greyhound: 1-800-231-2222', 'Airlines: ask Groove'],
  },
];

export default function HelpMe() {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const svc = SERVICES.find((s) => s.id === selected);
    const Icon = svc.icon;
    return (
      <div style={{ paddingBottom: 20 }} className="fade-up">
        {/* Back */}
        <div style={{ padding:'20px 20px 0' }}>
          <button
            onClick={() => setSelected(null)}
            style={{ display:'flex',alignItems:'center',gap:8,background:'none',border:'none',cursor:'pointer',fontSize:15,color:'var(--text-secondary)',fontFamily:'Poppins,sans-serif',fontWeight:500,padding:0 }}
          >
            <ArrowLeft size={18} /> Back to Help Me
          </button>
        </div>

        {/* Header */}
        <div style={{ margin:'16px 20px 0',background:`linear-gradient(135deg,${svc.color},${svc.color}CC)`,borderRadius:'var(--radius-lg)',padding:22,color:'#fff',boxShadow:`0 8px 28px ${svc.color}55` }}>
          <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:10 }}>
            <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <Icon size={26} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>{svc.label}</div>
              <div style={{ fontSize:13,opacity:0.85 }}>{svc.description}</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div style={{ margin:'16px 20px 0',background:'#fff',borderRadius:'var(--radius-lg)',padding:20,boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:17,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)',marginBottom:14 }}>How it works</p>
          {svc.steps.map((step, i) => (
            <div key={i} style={{ display:'flex',gap:14,alignItems:'flex-start',marginBottom:14 }}>
              <div style={{ width:36,height:36,borderRadius:12,background:svc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:16,color:svc.color }}>
                {i+1}
              </div>
              <p style={{ fontSize:15,color:'var(--text-secondary)',lineHeight:1.65,paddingTop:6 }}>{step}</p>
            </div>
          ))}
        </div>

        {/* Contact numbers */}
        <div style={{ margin:'14px 20px 0',background:'#fff',borderRadius:'var(--radius-lg)',padding:20,boxShadow:'var(--shadow-sm)' }}>
          <p style={{ fontSize:17,fontFamily:'Nunito,sans-serif',fontWeight:800,color:'var(--text-primary)',marginBottom:14 }}>📞 Helpful phone numbers</p>
          {svc.apps.map((app, i) => (
            <div key={i} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<svc.apps.length-1?'1px solid var(--border)':'none' }}>
              <div style={{ width:40,height:40,borderRadius:12,background:svc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <PhoneCall size={18} color={svc.color} />
              </div>
              <p style={{ fontSize:15,color:'var(--text-primary)',fontWeight:500 }}>{app}</p>
            </div>
          ))}
        </div>

        <div style={{ margin:'14px 20px 0' }}>
          <button className="btn-primary" style={{ width:'100%',fontSize:17,padding:18 }}>
            🎤 &nbsp;{svc.callLabel} with Groove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 20 }}>

      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#52B788,#3A9D6E)', margin:'20px 20px 0', borderRadius:'var(--radius-lg)', padding:22, color:'#fff', boxShadow:'0 8px 28px rgba(82,183,136,0.35)' }}>
        <div style={{ display:'flex',gap:12,alignItems:'center',marginBottom:10 }}>
          <div style={{ width:50,height:50,borderRadius:16,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <HelpCircle size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20 }}>Help Me</div>
            <div style={{ fontSize:13,opacity:0.85 }}>Cabs, food & travel — made easy</div>
          </div>
        </div>
        <p style={{ fontSize:14,opacity:0.9,lineHeight:1.65 }}>
          Need a cab, want food delivered, or booking a trip? Tap a button below and Groove will guide you step by step.
        </p>
      </div>

      {/* Big service buttons */}
      <div style={{ margin:'16px 20px 0',display:'flex',flexDirection:'column',gap:14 }}>
        {SERVICES.map((svc) => {
          const Icon = svc.icon;
          return (
            <button
              key={svc.id}
              onClick={() => setSelected(svc.id)}
              style={{
                background:'#fff', borderRadius:'var(--radius-lg)', padding:'20px 22px',
                display:'flex', alignItems:'center', gap:18,
                border:'none', cursor:'pointer', textAlign:'left',
                boxShadow:'var(--shadow-sm)', transition:'all 0.2s',
                width:'100%',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow='var(--shadow-sm)'}
            >
              <div style={{ width:64,height:64,borderRadius:20,background:svc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <Icon size={30} color={svc.color} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Nunito,sans-serif',fontWeight:900,fontSize:20,color:'var(--text-primary)',marginBottom:4 }}>{svc.label}</div>
                <div style={{ fontSize:14,color:'var(--text-muted)',lineHeight:1.5 }}>{svc.description}</div>
              </div>
              <div style={{ width:36,height:36,borderRadius:12,background:svc.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                <ArrowLeft size={18} color={svc.color} style={{ transform:'rotate(180deg)' }} />
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ margin:'20px 20px 0',background:'var(--teal-light)',borderRadius:'var(--radius-md)',padding:16,border:'1px solid var(--teal-mid)' }}>
        <p style={{ fontSize:14,fontWeight:700,color:'var(--teal-dark)',marginBottom:4 }}>💡 Tip</p>
        <p style={{ fontSize:14,color:'var(--text-secondary)',lineHeight:1.7 }}>You can also tap the mic button at the top and say "Book me a cab" or "Order food" — Groove will help right away.</p>
      </div>
    </div>
  );
}

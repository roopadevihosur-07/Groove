import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield } from 'lucide-react';

export default function ScamAlertBanner({ alerts = [] }) {
  const [expanded, setExpanded] = useState(null);

  if (!alerts.length) return (
    <p style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No active scam alerts.</p>
  );

  return (
    <div className="alert-list">
      {alerts.map((alert, i) => (
        <div key={i} className="alert-card" onClick={() => setExpanded(expanded === i ? null : i)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="alert-card-title">{alert.title}</div>
            {expanded === i ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
          </div>
          <div className="alert-card-desc">{alert.description?.slice(0, 90)}…</div>

          {expanded === i && (
            <div className="alert-detail fade-up">
              <div className="red-flags">
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Red flags</p>
                {alert.red_flags?.map((f, j) => (
                  <div key={j} className="red-flag-item">
                    <span style={{ color: 'var(--coral)', flexShrink: 0 }}>•</span> {f}
                  </div>
                ))}
              </div>
              <div className="how-respond">
                <Shield size={13} style={{ flexShrink: 0, marginTop: 1 }} />
                {alert.how_to_respond}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

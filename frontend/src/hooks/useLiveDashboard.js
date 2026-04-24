import { useEffect, useRef, useState } from 'react';

export function useLiveDashboard(userId, onEvent) {
  const esRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const es = new EventSource(`/api/dashboard/${userId}/live`);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        if (event.type !== 'connected') onEvent?.(event);
      } catch (_) {}
    };
    es.onerror = () => setConnected(false);

    return () => { es.close(); setConnected(false); };
  }, [userId]);

  return connected;
}

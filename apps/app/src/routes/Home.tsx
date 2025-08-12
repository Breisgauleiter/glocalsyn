import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface RecItem { id: string; title: string; reason: string; }

const ENABLE_RECS = (import.meta as any).env?.VITE_ENABLE_RECS === '1';

function useRecommendations(): RecItem[] {
  const [items, setItems] = useState<RecItem[]>([]);
  useEffect(() => {
    if (!ENABLE_RECS) return;
    // Placeholder: in Sprint 03 this will call graph service /recommendations/:userKey
    // Strategy: return at most 3 items with explainable reasons
    setItems([
      { id: 'q_bridge', title: 'Verbinde zwei Hubs', reason: 'Brücken‑Quest fördert Netzwerk' },
      { id: 'q_variety', title: 'Teile einen Lern-Link', reason: 'Vielfalt: anderer Quest‑Typ' },
      { id: 'q_progress', title: 'Peer‑Bestätigung holen', reason: 'Fortsetzung: ausstehender Review' },
    ]);
  }, []);
  return items;
}

export function Home() {
  const recs = useRecommendations();
  return (
    <section aria-labelledby="home-title" className="container stack center">
      <h1 id="home-title" className="h1">Syntopia</h1>
      <p className="p">Willkommen! Starte mit einer Mini‑Quest in drei Taps.</p>
      <p>
        <Link to="/login" aria-label="Jetzt starten" className="btn btn-primary">Jetzt starten</Link>
      </p>
      {ENABLE_RECS && (
        <div className="stack" aria-labelledby="today-rec-title">
          <h2 id="today-rec-title" className="h2">Heute dran…</h2>
          <ul className="stack" aria-label="Empfehlungen" style={{ listStyle: 'none', padding: 0 }}>
            {recs.map(r => (
              <li key={r.id} className="card" data-testid="rec-item">
                <div className="stack">
                  <strong>{r.title}</strong>
                  <small aria-label="Begründung" style={{ opacity: 0.8 }}>{r.reason}</small>
                </div>
              </li>
            ))}
          </ul>
          <p className="caption" style={{ opacity: 0.7 }}>Prototypische Empfehlungen – erklärt, transparent, lokal.</p>
        </div>
      )}
    </section>
  );
}

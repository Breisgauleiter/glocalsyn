import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchRecommendations } from '../features/graph/graphClient';
import { t } from '../i18n';
import { mapExplanation } from '../features/graph/recommendationReasons';
import { emit as emitTelemetry } from '../utils/telemetry';
import { useAuth } from '../features/auth/authStore';

interface RecItem { id: string; title: string; reason: string; }

function isRecsEnabled() {
  if ((globalThis as any).__TEST_ENABLE_RECS__ === true) return true; // test override
  return (import.meta as any).env?.VITE_ENABLE_RECS === '1';
}

function useRecommendations(): { items: RecItem[]; loading: boolean; error: string | null } {
  const [items, setItems] = useState<RecItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  useEffect(() => {
  if (!isRecsEnabled()) return; // remain empty
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const userKey = user?.id || 'demo-user';
        const recs = await fetchRecommendations({ userKey, limit: 3 });
        if (cancelled) return;
        if (recs.length === 0) {
          setItems([
            { id: 'q_bridge', title: 'Verbinde zwei Hubs', reason: t('recs.reason.bridge') },
            { id: 'q_variety', title: 'Teile einen Lern-Link', reason: t('recs.reason.diversity') },
            { id: 'q_progress', title: 'Peer‑Bestätigung holen', reason: t('recs.reason.continuation') },
          ]);
        } else {
          setItems(recs.map(r => {
            const first = r.reasons[0];
            const mapped = first ? mapExplanation(first.code, first.explanation) : { key: 'recs.reason.social_proof', fallback: 'Empfehlung' };
            const reasonText = t(mapped.key);
            // Emit explanation event for first render of each rec (simple heuristic)
            emitTelemetry({ ts: Date.now(), type: 'recommendation_explained', nodeId: r.node._key, reasonCode: first.code, locale: 'de' });
            return { id: r.node._key, title: r.node.name, reason: reasonText };
          }));
        }
      } catch (e: any) {
        if (cancelled) return;
        setError(e.message || 'Fehler');
        // fallback placeholder on error
        setItems([
          { id: 'q_bridge', title: 'Verbinde zwei Hubs', reason: 'Brücken‑Quest fördert Netzwerk' },
          { id: 'q_variety', title: 'Teile einen Lern-Link', reason: 'Vielfalt: anderer Quest‑Typ' },
          { id: 'q_progress', title: 'Peer‑Bestätigung holen', reason: 'Fortsetzung: ausstehender Review' },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);
  return { items, loading, error };
}

export function Home() {
  const { items: recs, loading, error } = useRecommendations();
  return (
    <section aria-labelledby="home-title" className="container stack center">
      <h1 id="home-title" className="h1">Syntopia</h1>
      <p className="p">Willkommen! Starte mit einer Mini‑Quest in drei Taps.</p>
      <p>
        <Link to="/profile-setup" aria-label="Jetzt starten" className="btn btn-primary">Jetzt starten</Link>
      </p>
    {isRecsEnabled() && (
        <div className="stack" aria-labelledby="today-rec-title">
      <h2 id="today-rec-title" className="h2">{t('recs.heading.today')}</h2>
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
          {loading && <p role="status" aria-live="polite">Lade Empfehlungen…</p>}
          {error && <p role="alert" style={{ color: 'var(--danger, #b00)' }}>Empfehlungen nicht erreichbar – zeige Platzhalter.</p>}
          <p className="caption" style={{ opacity: 0.7 }}>{t('recs.prototype.caption')}</p>
        </div>
      )}
    </section>
  );
}


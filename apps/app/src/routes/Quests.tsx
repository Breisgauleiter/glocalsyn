import { useState } from 'react';

export function Quests() {
  const [status, setStatus] = useState<'available' | 'accepted' | 'done'>('available');

  return (
    <section aria-labelledby="quests-title" style={{ padding: 16 }}>
      <h1 id="quests-title">Quests</h1>
      <p>Hier findest du deine Mini‑Quests.</p>
      <article aria-labelledby="dummy-quest-title" aria-describedby="dummy-quest-desc" className="glass-card">
        <h2 id="dummy-quest-title">Dummy‑Quest: Begrüße deinen Hub</h2>
        <p id="dummy-quest-desc">Sag Hallo im lokalen Hub‑Channel. Dauer: 1 Minute.</p>
        {status === 'available' && (
          <button aria-label="Quest annehmen" onClick={() => setStatus('accepted')}>Annehmen</button>
        )}
        {status === 'accepted' && (
          <button aria-label="Quest als erledigt markieren" onClick={() => setStatus('done')}>Erledigt</button>
        )}
        {status === 'done' && <p role="status">Erledigt! 🎉</p>}
      </article>
    </section>
  );
}

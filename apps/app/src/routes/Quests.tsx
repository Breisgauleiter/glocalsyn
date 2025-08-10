import { useState } from 'react';

export function Quests() {
  const [status, setStatus] = useState<'available' | 'accepted' | 'done'>('available');

  return (
    <section aria-labelledby="quests-title" className="container stack">
      <h1 id="quests-title" className="h1">Quests</h1>
      <p className="p">Hier findest du deine Mini‑Quests.</p>
      <article aria-labelledby="dummy-quest-title" aria-describedby="dummy-quest-desc" className="glass-card stack">
        <h2 id="dummy-quest-title" className="h1">Dummy‑Quest: Begrüße deinen Hub</h2>
        <p id="dummy-quest-desc" className="p">Sag Hallo im lokalen Hub‑Channel. Dauer: 1 Minute.</p>
        {status === 'available' && (
          <button className="btn btn-primary" aria-label="Quest annehmen" onClick={() => setStatus('accepted')}>Annehmen</button>
        )}
        {status === 'accepted' && (
          <button className="btn btn-primary" aria-label="Quest als erledigt markieren" onClick={() => setStatus('done')}>Erledigt</button>
        )}
        {status === 'done' && <p role="status">Erledigt! 🎉</p>}
      </article>
    </section>
  );
}

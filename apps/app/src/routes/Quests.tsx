import { useQuestStore } from '../features/quests/questStore';

export function Quests() {
  const { quests, status, accept, complete } = useQuestStore();

  return (
    <section aria-labelledby="quests-title" className="container stack">
      <h1 id="quests-title" className="h1">Quests</h1>
      <p className="p">Hier findest du deine Mini‑Quests.</p>
      {quests.map((q) => (
        <article key={q.id} aria-labelledby={`quest-title-${q.id}`} aria-describedby={`quest-desc-${q.id}`} className="glass-card stack">
          <h2 id={`quest-title-${q.id}`} className="h1">{q.title}</h2>
          <p id={`quest-desc-${q.id}`} className="p">{q.description}</p>
          {status(q.id) === 'available' && (
            <button type="button" className="btn btn-primary" aria-label="Quest annehmen" onClick={() => accept(q.id)}>Annehmen</button>
          )}
          {status(q.id) === 'accepted' && (
            <button type="button" className="btn btn-primary" aria-label="Quest als erledigt markieren" onClick={() => complete(q.id)}>Erledigt</button>
          )}
          {status(q.id) === 'done' && <p role="status">Erledigt! 🎉</p>}
        </article>
      ))}
    </section>
  );
}

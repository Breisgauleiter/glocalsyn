import { useQuestStore } from '../features/quests/questStore';
import { Link } from 'react-router-dom';
import { useProfile } from '../features/profile/profileStore';
import { useEffect, useRef, useState } from 'react';

export function Quests() {
  const { profile, update } = useProfile();
  const { quests, status, accept, start, submit, markCompleted } = useQuestStore(profile);
  const unlocked = profile.githubLinked && (profile.scl ?? 1) >= 4;
  const [filter, setFilter] = useState<'all' | 'github' | 'local'>(() => {
    const stored = localStorage.getItem('quests.filter');
    if (stored === 'github' || stored === 'local' || stored === 'all') return stored;
    return 'all';
  });
  const [highlightUnlocked, setHighlightUnlocked] = useState(false);
  const prevUnlocked = useRef(unlocked);

  const filtered = quests.filter((q) => {
    if (filter === 'github') return q.source?.kind === 'github_issue';
    if (filter === 'local') return !q.source || q.source.kind !== 'github_issue';
    return true;
  });

  function linkGithubInline() {
    const nextScl = Math.max(profile.scl ?? 1, 4);
    update({ githubLinked: true, scl: nextScl as any });
    // If user is on "Alle", switch to GitHub and persist
    if (filter === 'all') {
      setFilter('github');
      localStorage.setItem('quests.filter', 'github');
    }
  }

  // On first unlock transition, auto-switch filter to GitHub when user is on "Alle"
  useEffect(() => {
    if (!prevUnlocked.current && unlocked) {
      if (filter === 'all') {
        setFilter('github');
        localStorage.setItem('quests.filter', 'github');
      }
      setHighlightUnlocked(true);
      const t = setTimeout(() => setHighlightUnlocked(false), 1200);
      return () => clearTimeout(t);
    }
    prevUnlocked.current = unlocked;
  }, [unlocked, filter]);

  return (
    <section aria-labelledby="quests-title" className="container stack">
      <h1 id="quests-title" className="h1">Quests</h1>
      <p className="p">Hier findest du deine Mini‑Quests.</p>
      {unlocked && (
        <p role="status" aria-live="polite" className="p">
          GitHub‑Quests freigeschaltet. Viel Erfolg!
        </p>
      )}
    <fieldset className="glass-card" aria-labelledby="source-filter-legend">
        <legend id="source-filter-legend">Quelle filtern</legend>
        <div role="radiogroup" aria-label="Quell-Filter" className="row" style={{ gap: 8 }}>
      <label><input type="radio" name="source-filter" checked={filter==='all'} onChange={() => { setFilter('all'); localStorage.setItem('quests.filter', 'all'); }} aria-label="Alle" /> Alle</label>
      <label><input type="radio" name="source-filter" checked={filter==='github'} onChange={() => { setFilter('github'); localStorage.setItem('quests.filter', 'github'); }} aria-label="GitHub" data-testid="filter-github" /> GitHub</label>
      <label><input type="radio" name="source-filter" checked={filter==='local'} onChange={() => { setFilter('local'); localStorage.setItem('quests.filter', 'local'); }} aria-label="Lokal" data-testid="filter-local" /> Lokal</label>
        </div>
      </fieldset>
      {filtered.length === 0 && (
        <p className="p muted" role="status" aria-live="polite" data-testid="empty-state">
          {filter === 'github' && (
            <>
              Keine GitHub‑Quests verfügbar.{' '}
              {!unlocked && (
                <button type="button" className="btn btn-primary" onClick={linkGithubInline} aria-label="GitHub verknüpfen" data-testid="empty-link-github">
                  GitHub verknüpfen
                </button>
              )}
            </>
          )}
          {filter === 'local' && 'Keine lokalen Quests verfügbar.'}
          {filter === 'all' && 'Keine Quests verfügbar.'}
        </p>
      )}
      {filtered.map((q) => (
        <article
          key={q.id}
          aria-labelledby={`quest-title-${q.id}`}
          aria-describedby={`quest-desc-${q.id}`}
          className="glass-card stack"
          data-testid={`quest-item-${q.source?.kind ?? 'local'}`}
          style={q.source?.kind === 'github_issue' && highlightUnlocked ? { outline: '2px solid rgba(0, 200, 255, 0.8)' } : undefined}
        >
          <h2 id={`quest-title-${q.id}`} className="h1"><Link to={`/quests/${q.id}`}>{q.title}</Link></h2>
          <p className="p" role="note">Kategorie: <strong>{q.category}</strong>{q.effortMinutes ? ` • ~${q.effortMinutes} min` : ''}</p>
          <p id={`quest-desc-${q.id}`} className="p">{q.description}</p>
          <p className="p" role="note">
            Quelle: <small data-testid={`source-badge-${q.source?.kind === 'github_issue' ? 'github' : 'local'}`}>{q.source?.kind === 'github_issue' ? 'GitHub' : 'Lokal'}</small>
          </p>
          {q.proof && (
            <p className="p" role="note">Nachweis: {q.proof.description}</p>
          )}
          {q.source?.kind === 'github_issue' && (
            <p className="p">Quelle: <a href={q.source.url} target="_blank" rel="noreferrer">{q.source.repo}#{q.source.number}</a></p>
          )}
          {status(q.id) === 'available' && (
            <button className="btn btn-primary" aria-label="Quest annehmen" onClick={() => accept(q.id)}>Annehmen</button>
          )}
          {status(q.id) === 'accepted' && (
            <div className="row" style={{ gap: 8 }}>
              {(q.proof?.type === 'complete' || q.proof?.type === 'check_in') ? (
                <button className="btn btn-primary" aria-label="Quest abschließen" onClick={() => submit(q.id)}>Abschließen</button>
              ) : (
                <button className="btn btn-primary" aria-label="Quest starten" onClick={() => start(q.id)}>Starten</button>
              )}
            </div>
          )}
          {status(q.id) === 'in_progress' && (
            <button className="btn btn-primary" aria-label="Nachweis einreichen" onClick={() => submit(q.id)}>Nachweis einreichen</button>
          )}
          {status(q.id) === 'submitted' && (
            <div className="row" style={{ gap: 8 }}>
              <p role="status" className="p">Eingereicht – Prüfung ausstehend</p>
              <button className="btn" aria-label="Manuell als erledigt markieren" onClick={() => markCompleted(q.id)}>Review OK</button>
            </div>
          )}
          {status(q.id) === 'completed' && <p role="status">Erledigt! 🎉</p>}
        </article>
      ))}
    </section>
  );
}

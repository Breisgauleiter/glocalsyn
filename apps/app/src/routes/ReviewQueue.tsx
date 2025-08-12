import { useQuestStore } from '../features/quests/questStore';
import { useProfile } from '../features/profile/profileStore';
import { useMemo, useState } from 'react';

export function ReviewQueue() {
  const { profile } = useProfile();
  const { quests, proofs, approve, reject } = useQuestStore(profile);
  const [filter, setFilter] = useState<'all' | 'photo' | 'peer' | 'text' | 'link'>('all');
  const pendingRaw = Object.values(proofs).filter(p => p.status === 'pending');
  const pending = useMemo(() => pendingRaw
    .map(p => ({ p, quest: quests.find(q => q.id === p.questId) }))
    .filter(({ quest }) => !!quest)
    .filter(({ quest }) => {
      if (filter === 'all') return true;
      if (filter === 'photo') return quest?.proof?.type === 'photo';
      if (filter === 'peer') return quest?.proof?.type === 'peer_confirm';
      if (filter === 'text') return quest?.proof?.type === 'text_note';
      if (filter === 'link') return quest?.proof?.type === 'link';
      return true;
    })
    .sort((a,b) => a.p.submittedAt.localeCompare(b.p.submittedAt)), [pendingRaw, quests, filter]);

  return (
    <section aria-labelledby="review-title" className="container stack">
      <h1 id="review-title" className="h1">Review Queue</h1>
      <p className="p">Offene Nachweise zur Prüfung.</p>
      <div className="row" style={{ gap: 4 }} role="group" aria-label="Filter Nachweise">
        {['all','photo','peer','text','link'].map(f => (
          <button key={f} className={filter===f ? 'btn btn-primary' : 'btn'} data-testid={`rq-filter-${f}`} onClick={() => setFilter(f as any)}>{f}</button>
        ))}
      </div>
      {pending.length === 0 && <p role="status" aria-live="polite" className="p" data-testid="rq-empty">Keine offenen Nachweise.</p>}
      <ul className="stack" style={{ listStyle: 'none', padding: 0 }}>
        {pending.map(({ p, quest }) => {
          const type = quest?.proof?.type;
          const data: any = p.data;
          return (
            <li key={p.questId} className="glass-card stack" aria-label={`Nachweis für ${quest?.title || p.questId}`} data-testid="rq-item">
              <h2 className="h2">{quest?.title ?? p.questId}</h2>
              <p className="p">Typ: <strong data-testid="rq-type">{type}</strong> • Eingereicht: {new Date(p.submittedAt).toLocaleTimeString()}</p>
              {type === 'text_note' && data?.note && <p className="p" data-testid="rq-note">Notiz: {data.note}</p>}
              {type === 'peer_confirm' && data?.note && <p className="p" data-testid="rq-peer-note">Peer-Notiz: {data.note}</p>}
              {type === 'link' && data?.url && <p className="p">Link: <a href={data.url} target="_blank" rel="noreferrer" data-testid="rq-link">{data.url}</a></p>}
              {type === 'photo' && data?.photo && <img src={data.photo} alt="Foto Nachweis" style={{ maxWidth: 180 }} data-testid="rq-photo" />}
              {!(type === 'text_note' || type === 'peer_confirm' || type === 'link' || type === 'photo') && (
                <pre style={{ maxWidth: '100%', overflowX: 'auto' }} data-testid="rq-raw"><code>{JSON.stringify(data, null, 2) || ''}</code></pre>
              )}
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary" onClick={() => approve(p.questId)} aria-label="Nachweis akzeptieren" data-testid="rq-approve">{type === 'peer_confirm' ? 'Bestätigen' : 'Akzeptieren'}</button>
                <button className="btn" onClick={() => reject(p.questId, 'Bitte ergänzen')} aria-label="Nachweis zurückweisen" data-testid="rq-reject">Ablehnen</button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

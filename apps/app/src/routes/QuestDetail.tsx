import { useParams, Link } from 'react-router-dom';
import { useQuestStore } from '../features/quests/questStore';
import { useProfile } from '../features/profile/profileStore';
import { useState } from 'react';
import { fileToResizedDataURL } from '../utils/image';

export function QuestDetail() {
  const { id } = useParams();
  const { profile } = useProfile();
  const { quests, status, accept, start, submit, markCompleted } = useQuestStore(profile);
  const quest = quests.find(q => q.id === id);
  const [showProof, setShowProof] = useState(false);
  const [note, setNote] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [peerNote, setPeerNote] = useState('');
  const st = quest ? status(quest.id) : 'available';

  if (!quest) return <section className="container"><p>Quest nicht gefunden.</p><p><Link to="/quests">Zurück</Link></p></section>;

  return (
    <section className="container stack" aria-labelledby="quest-detail-title">
      <h1 id="quest-detail-title" className="h1">{quest.title}</h1>
      <p className="p">Kategorie: <strong>{quest.category}</strong>{quest.minimumSCL && <> • SCL ≥ {quest.minimumSCL}</>}</p>
      {quest.effortMinutes && <p className="p">Aufwand: ~{quest.effortMinutes} min</p>}
      <p className="p">{quest.description}</p>
      {quest.proof && <p className="p" role="note">Nachweis: {quest.proof.description}</p>}
      {quest.source?.kind === 'github_issue' && (
        <p className="p">Quelle: <a href={quest.source.url} target="_blank" rel="noreferrer">{quest.source.repo}#{quest.source.number}</a></p>
      )}
      <p className="p">Status: {st}</p>

      {st === 'available' && (
        <button className="btn btn-primary" data-testid="detail-accept" onClick={() => accept(quest.id)}>Annehmen</button>
      )}
      {st === 'accepted' && (quest.proof?.type === 'complete' || quest.proof?.type === 'check_in') && (
        <button className="btn btn-primary" data-testid="detail-complete" onClick={() => submit(quest.id)}>Abschließen</button>
      )}
      {st === 'accepted' && !(quest.proof?.type === 'complete' || quest.proof?.type === 'check_in') && (
        <button className="btn btn-primary" data-testid="detail-start" onClick={() => start(quest.id)}>Starten</button>
      )}
      {st === 'in_progress' && !(quest.proof?.type === 'complete' || quest.proof?.type === 'check_in') && (
        <div className="stack">
          <button className="btn" data-testid="toggle-proof" aria-expanded={showProof} onClick={() => setShowProof(s => !s)}>
            {showProof ? 'Nachweis schließen' : 'Nachweis einreichen'}
          </button>
          {showProof && (
            <form aria-label="Nachweis Formular" className="stack" onSubmit={(e) => {
              e.preventDefault();
              let proofData: any = undefined;
              if (quest.proof?.type === 'text_note') proofData = { note };
              if (quest.proof?.type === 'link') proofData = { url: linkValue };
              if (quest.proof?.type === 'photo' && photoData) proofData = { photo: photoData };
              if (quest.proof?.type === 'peer_confirm') proofData = { note: peerNote };
              submit(quest.id, proofData);
            }} data-testid="proof-form">
              {quest.proof?.type === 'text_note' && (
                <label className="stack">
                  <span className="p">Notiz<span aria-hidden> *</span></span>
                  <textarea required value={note} onChange={e => setNote(e.target.value)} data-testid="proof-note" />
                </label>
              )}
              {quest.proof?.type === 'link' && (
                <label className="stack">
                  <span className="p">Link<span aria-hidden> *</span></span>
                  <input required type="url" value={linkValue} onChange={e => setLinkValue(e.target.value)} placeholder="https://" data-testid="proof-link" />
                </label>
              )}
              {quest.proof?.type === 'photo' && (
                <label className="stack">
                  <span className="p">Foto<span aria-hidden> *</span></span>
          <input required type="file" accept="image/*" data-testid="proof-photo" onChange={async e => {
                    const file = e.target.files?.[0];
                    if (file) {
            const dataUrl = await fileToResizedDataURL(file, { maxDim: 800, mime: 'image/jpeg', quality: 0.8 });
            setPhotoData(dataUrl);
                    }
                  }} />
                  {photoData && <img src={photoData} alt="Foto Vorschau" style={{ maxWidth: 120 }} data-testid="proof-photo-preview" />}
                </label>
              )}
              {quest.proof?.type === 'peer_confirm' && (
                <label className="stack">
                  <span className="p">Peer-Notiz (optional)</span>
                  <textarea value={peerNote} onChange={e => setPeerNote(e.target.value)} data-testid="proof-peer-note" />
                </label>
              )}
              {quest.proof?.type === 'github_pr' && (
                <p className="p" data-testid="proof-github-pr-hint">Öffne einen PR der das Issue schließt. Sync folgt.</p>
              )}
              <div className="row" style={{ gap: 8 }}>
                <button className="btn btn-primary" type="submit" data-testid="submit-proof">Senden</button>
              </div>
            </form>
          )}
        </div>
      )}
      {st === 'submitted' && <p role="status" className="p">Eingereicht – Review ausstehend</p>}
      {st === 'completed' && <p role="status" className="p">Erledigt! 🎉</p>}

      {st === 'submitted' && (
        <button className="btn" onClick={() => markCompleted(quest.id)} data-testid="detail-force-complete">Review OK</button>
      )}
      <p><Link to="/quests" aria-label="Zurück zur Questliste" className="btn">Zurück</Link></p>
    </section>
  );
}

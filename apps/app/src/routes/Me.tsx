import { useMemo, useState } from 'react';
import { useProfile } from '../features/profile/profileStore';

export function Me() {
  const { profile, update } = useProfile();
  const canLink = useMemo(() => !profile.githubLinked, [profile.githubLinked]);
  const [reposInput, setReposInput] = useState<string>(() => (profile.githubRepos ?? []).join(', '));
  const [labelsInput, setLabelsInput] = useState<string>(() => (profile.githubLabels ?? []).join(', '));
  const [stateInput, setStateInput] = useState<'open' | 'closed' | 'all'>(profile.githubIssueState ?? 'open');
  const [tokenInput, setTokenInput] = useState<string>(() => profile.githubToken ?? '');
  const [repoError, setRepoError] = useState<string | null>(null);

  function linkGithub() {
    const nextScl = Math.max(profile.scl ?? 1, 4);
    update({ githubLinked: true, scl: nextScl as any });
  }

  function saveRepos(e: React.FormEvent) {
    e.preventDefault();
    const repos = reposInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const invalid = repos.filter((r) => !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(r));
    if (invalid.length > 0) {
      setRepoError(`Ungültiges Format: ${invalid.join(', ')}. Erwartet: owner/name.`);
      return;
    }
    setRepoError(null);
    update({ githubRepos: repos });
  }

  return (
    <section aria-labelledby="me-title" className="container stack" style={{ padding: 16 }}>
      <h1 id="me-title">Ich</h1>
      <p>Profil & Einstellungen.</p>

      <div className="glass-card" role="group" aria-labelledby="account-section-title">
        <h2 id="account-section-title" className="h3">Account</h2>
        <dl className="stack" style={{ gap: 8 }}>
          <div>
            <dt className="muted">SCL</dt>
            <dd><strong aria-live="polite">{profile.scl ?? 1}</strong></dd>
          </div>
          <div>
            <dt className="muted">GitHub</dt>
            <dd aria-live="polite">{profile.githubLinked ? 'Verknüpft' : 'Nicht verknüpft'}</dd>
          </div>
          <div>
            <dt className="muted">Badges</dt>
            <dd aria-live="polite" data-testid="badge-list">{(profile.badges && profile.badges.length > 0) ? profile.badges.join(', ') : '—'}</dd>
          </div>
        </dl>

        {canLink ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={linkGithub}
            aria-label="GitHub verknüpfen"
            data-testid="link-github"
          >
            GitHub verknüpfen
          </button>
        ) : (
          <>
            <p className="muted" aria-live="polite">GitHub ist verknüpft. Danke!</p>
            <form onSubmit={saveRepos} className="stack" style={{ gap: 8 }} aria-label="GitHub Einstellungen">
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="muted" style={{ fontWeight: 700, marginBottom: 8 }}>GitHub Einstellungen</legend>
                <label htmlFor="repos-input" className="muted" style={{ display: 'block', marginBottom: 4 }}>Repos <span style={{ fontWeight: 400 }}>(owner/name, komma-separiert)</span></label>
                <input
                  id="repos-input"
                  name="repos"
                  type="text"
                  className="input"
                  value={reposInput}
                  onChange={(e) => setReposInput(e.target.value)}
                  placeholder="owner1/repo1, owner2/repo2"
                  aria-describedby="repos-help repos-error"
                  autoComplete="off"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--text)' }}
                />
                {repoError ? (
                  <p id="repos-error" role="alert" className="error" style={{ color: '#FF4F4F', marginTop: 4, fontWeight: 600, background: 'rgba(255,79,79,0.08)', borderRadius: 6, padding: '4px 8px' }}>{repoError}</p>
                ) : null}
                <small id="repos-help" className="muted" style={{ display: 'block', marginBottom: 8 }}>Diese Auswahl überschreibt die Standard-Repo-Liste. Leer lassen = Standard verwenden.</small>

                <label htmlFor="state-input" className="muted" style={{ display: 'block', marginBottom: 4 }}>Issue-Status</label>
                <select
                  id="state-input"
                  className="input"
                  value={stateInput}
                  onChange={(e) => setStateInput(e.target.value as any)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--text)' }}
                >
                  <option value="open">open</option>
                  <option value="closed">closed</option>
                  <option value="all">all</option>
                </select>

                <label htmlFor="labels-input" className="muted" style={{ display: 'block', marginBottom: 4 }}>Labels <span style={{ fontWeight: 400 }}>(komma-separiert)</span></label>
                <input
                  id="labels-input"
                  name="labels"
                  type="text"
                  className="input"
                  value={labelsInput}
                  onChange={(e) => setLabelsInput(e.target.value)}
                  placeholder="good-first-issue, help-wanted"
                  autoComplete="off"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--text)' }}
                />

                <label htmlFor="token-input" className="muted" style={{ display: 'block', marginBottom: 4 }}>GitHub Token <span style={{ fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="token-input"
                  name="token"
                  type="password"
                  className="input"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="ghp_..."
                  autoComplete="off"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--text)' }}
                />
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ minWidth: 120, fontWeight: 700, fontSize: '1rem', boxShadow: '0 0 12px 2px #7dd3fc55', border: '1px solid #7dd3fc', background: 'linear-gradient(90deg, #7dd3fc33 0%, #7dd3fc11 100%)' }}
                    onClick={() => {
                      // Persist all settings when saving repos form
                      const labels = labelsInput.split(',').map((s) => s.trim()).filter(Boolean);
                      update({ githubIssueState: stateInput, githubLabels: labels, githubToken: tokenInput || undefined });
                    }}
                  >
                    <span role="img" aria-label="Speichern" style={{ marginRight: 6 }}>💾</span> Speichern
                  </button>
                </div>
              </fieldset>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

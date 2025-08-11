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
              <label htmlFor="repos-input" className="muted">Repos (owner/name, komma-separiert)</label>
              <input
                id="repos-input"
                name="repos"
                type="text"
                value={reposInput}
                onChange={(e) => setReposInput(e.target.value)}
                placeholder="owner1/repo1, owner2/repo2"
                aria-describedby="repos-help"
              />
              {repoError ? (
                <p role="alert" className="error" style={{ color: 'var(--danger, #b00020)' }}>{repoError}</p>
              ) : null}
              <small id="repos-help" className="muted">Diese Auswahl überschreibt die Standard-Repo-Liste. Leer lassen = Standard verwenden.</small>

              <label htmlFor="state-input" className="muted">Issue-Status</label>
              <select id="state-input" value={stateInput} onChange={(e) => setStateInput(e.target.value as any)}>
                <option value="open">open</option>
                <option value="closed">closed</option>
                <option value="all">all</option>
              </select>

              <label htmlFor="labels-input" className="muted">Labels (komma-separiert)</label>
              <input
                id="labels-input"
                name="labels"
                type="text"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                placeholder="good-first-issue, help-wanted"
              />

              <label htmlFor="token-input" className="muted">GitHub Token (optional)</label>
              <input
                id="token-input"
                name="token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="ghp_..."
                autoComplete="off"
              />
              <div>
                <button
                  type="submit"
                  className="btn"
                  onClick={() => {
                    // Persist all settings when saving repos form
                    const labels = labelsInput.split(',').map((s) => s.trim()).filter(Boolean);
                    update({ githubIssueState: stateInput, githubLabels: labels, githubToken: tokenInput || undefined });
                  }}
                >Speichern</button>
              </div>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

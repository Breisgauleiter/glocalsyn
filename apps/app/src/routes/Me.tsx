import { useMemo } from 'react';
import { useProfile } from '../features/profile/profileStore';

export function Me() {
  const { profile, update } = useProfile();
  const canLink = useMemo(() => !profile.githubLinked, [profile.githubLinked]);

  function linkGithub() {
    const nextScl = Math.max(profile.scl ?? 1, 4);
    update({ githubLinked: true, scl: nextScl as any });
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
          <p className="muted" aria-live="polite">GitHub ist verknüpft. Danke!</p>
        )}
      </div>
    </section>
  );
}

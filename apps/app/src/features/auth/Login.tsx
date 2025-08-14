import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestMagicLink, consumeMagicLink, getMe, loginCredentials } from './authClient';

export function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle'|'sent'|'verifying'|'error'>('idle');
  const [error, setError] = useState<string|undefined>();
  const [devToken, setDevToken] = useState<string>('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Restore session if present
    getMe().then(u => { if (u) nav('/'); }).catch(() => {});
  }, [nav]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('idle'); setError(undefined);
    requestMagicLink(email)
      .then((res: any) => {
        setStatus('sent');
        if (res?.devToken) setDevToken(res.devToken);
      })
      .catch((err) => { setStatus('error'); setError(err?.message || 'Fehler'); });
  }
  async function onConsume(e: FormEvent) {
    e.preventDefault();
    setStatus('verifying'); setError(undefined);
    try {
      await consumeMagicLink(devToken);
      nav('/profile-setup');
    } catch (err: any) {
      setStatus('error'); setError(err?.message || 'Fehler');
    }
  }

  async function onLoginCredentials(e: FormEvent) {
    e.preventDefault(); setError(undefined);
    try {
      await loginCredentials(id, password);
      nav('/');
    } catch (err: any) {
      setStatus('error'); setError(err?.message || 'Fehler');
    }
  }

  return (
    <section className="container stack glass-card" aria-labelledby="login-title">
      <h1 id="login-title" className="h1">Login</h1>
      <form onSubmit={onLoginCredentials} role="form" className="stack">
        <label htmlFor="id">E‑Mail oder Nutzername</label>
        <input id="id" name="id" className="input" value={id} onChange={(e)=>setId(e.currentTarget.value)} required />
        <label htmlFor="password">Passwort</label>
        <input id="password" name="password" type="password" className="input" value={password} onChange={(e)=>setPassword(e.currentTarget.value)} required />
        <button type="submit" className="btn btn-primary" disabled={!id||!password}>Anmelden</button>
      </form>
      <hr aria-hidden="true" />
      <form onSubmit={onSubmit} role="form" className="stack">
        <label htmlFor="email">E-Mail</label>
        <input id="email" name="email" type="email" className="input" value={email} onChange={(e)=>setEmail(e.currentTarget.value)} required />
        <small className="muted">Wir senden dir einen Magic Link.</small>
        <button type="submit" className="btn btn-primary" disabled={!email}>Link senden</button>
      </form>
      {status === 'sent' && (
        <div className="stack" role="status" aria-live="polite">
          <strong>Link gesendet.</strong>
          <small>Prüfe dein Postfach. Im Dev-Modus kannst du den Token unten einfügen.</small>
        </div>
      )}
      {(status === 'sent' || devToken) && (
        <form onSubmit={onConsume} className="stack" aria-label="Dev Verification">
          <label htmlFor="token">Token (Dev)</label>
          <input id="token" name="token" className="input" value={devToken} onChange={(e)=>setDevToken(e.currentTarget.value)} placeholder="dev token…" />
          <button type="submit" className="btn">Anmelden</button>
        </form>
      )}
      {status === 'error' && <p role="alert" style={{ color: 'var(--danger,#b00)' }}>{error}</p>}
    </section>
  );
}

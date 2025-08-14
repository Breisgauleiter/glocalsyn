import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, registerCredentials } from './authClient';

export function Register() {
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getMe().then(u => { if (u) nav('/'); }).catch(()=>{}); }, [nav]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    try {
      await registerCredentials(username, email, password);
      nav('/profile-setup');
    } catch (err: any) {
      setError(err?.message || 'Fehler');
    } finally { setBusy(false); }
  }

  return (
    <section className="container stack glass-card" aria-labelledby="register-title">
      <h1 id="register-title" className="h1">Registrieren</h1>
      <form onSubmit={onSubmit} className="stack" role="form">
        <label htmlFor="username">Nutzername</label>
        <input id="username" name="username" className="input" value={username} onChange={(e)=>setUsername(e.currentTarget.value)} required />
        <label htmlFor="email">E‑Mail</label>
        <input id="email" name="email" className="input" type="email" value={email} onChange={(e)=>setEmail(e.currentTarget.value)} required />
        <label htmlFor="password">Passwort</label>
        <input id="password" name="password" className="input" type="password" value={password} onChange={(e)=>setPassword(e.currentTarget.value)} required />
        <button className="btn btn-primary" type="submit" disabled={!username||!email||!password||busy}>Anlegen</button>
      </form>
      {error && <p role="alert" style={{ color: 'var(--danger,#b00)' }}>{error}</p>}
    </section>
  );
}

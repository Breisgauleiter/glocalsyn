import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthMock } from './authStore';

export function Login() {
  const nav = useNavigate();
  const { login } = useAuthMock();
  const [name, setName] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    login(name || 'Gast');
    nav('/profile-setup');
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby="login-title" style={{ padding: 16 }}>
      <h1 id="login-title">Login</h1>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder=""
        aria-describedby="name-hint"
      />
      <div id="name-hint">Kurzer Name, keine Sonderzeichen.</div>
      <button type="submit">Weiter</button>
    </form>
  );
}

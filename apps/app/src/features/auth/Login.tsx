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
    <form onSubmit={onSubmit} aria-labelledby="login-title" className="container stack glass-card" role="form">
      <h1 id="login-title" className="h1">Login</h1>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        name="name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        placeholder=""
        aria-describedby="name-hint"
        className="input"
      />
      <div id="name-hint" className="p">Kurzer Name, keine Sonderzeichen.</div>
      <button type="submit" className="btn btn-primary">Weiter</button>
    </form>
  );
}

import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileWizard() {
  const nav = useNavigate();
  const [region, setRegion] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // persist minimal profile client-side
    localStorage.setItem('profile', JSON.stringify({ region }));
    nav('/quests');
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby="wizard-title" className="container stack glass-card" role="form">
      <h1 id="wizard-title" className="h1">Profil</h1>
      <label htmlFor="region">Region</label>
      <input id="region" name="region" value={region} onChange={(e) => setRegion(e.currentTarget.value)} className="input" />
      <button type="submit" className="btn btn-primary">Fertig</button>
    </form>
  );
}

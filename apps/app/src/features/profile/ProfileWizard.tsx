import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileWizard() {
  const nav = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    // persist minimal profile client-side
    localStorage.setItem('profile', JSON.stringify({ name, region }));
    nav('/quests');
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby="wizard-title" className="container stack glass-card" role="form">
      <h1 id="wizard-title" className="h1">Profil</h1>
      {step === 1 && (
        <div className="stack">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" value={name} onChange={(e) => setName(e.currentTarget.value)} className="input" />
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Weiter</button>
        </div>
      )}
      {step === 2 && (
        <div className="stack">
          <label htmlFor="region">Region</label>
          <input id="region" name="region" value={region} onChange={(e) => setRegion(e.currentTarget.value)} className="input" />
          <button type="submit" className="btn btn-primary">Fertig</button>
        </div>
      )}
    </form>
  );
}

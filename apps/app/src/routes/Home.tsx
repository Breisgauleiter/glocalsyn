import { Link } from 'react-router-dom';

export function Home() {
  return (
    <section aria-labelledby="home-title" className="container stack center">
      <h1 id="home-title" className="h1">Syntopia</h1>
      <p className="p">Willkommen! Starte mit einer Mini‑Quest in drei Taps.</p>
      <p>
        <Link to="/login" aria-label="Jetzt starten" className="btn btn-primary">Jetzt starten</Link>
      </p>
    </section>
  );
}

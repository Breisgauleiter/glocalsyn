import { Link } from 'react-router-dom';

export function Home() {
  return (
    <section aria-labelledby="home-title" style={{ padding: 16 }}>
      <h1 id="home-title">Syntopia</h1>
      <p>Willkommen! Starte mit einer Mini‑Quest in drei Taps.</p>
      <p>
        <Link to="/login" aria-label="Jetzt starten">Jetzt starten</Link>
      </p>
    </section>
  );
}

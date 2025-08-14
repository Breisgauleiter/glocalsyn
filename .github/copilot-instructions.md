# Syntopia – Repository Instructions

## Leitbild
Mobile-first, kooperatives Real-World-Aufbauspiel. Klare, freundliche Sprache. Datenschutz & Inklusion als Feature.

## Grundsätze

### UX-Prinzipien
- **Mobile-first UX**: 3-Tap von Start zur Mini-Quest; eine klare Aufgabe pro Screen
- **Graph-Denken**: Empfehlungen verbinden Menschen & Orte sinnvoll; Brücken-Quests werden gefördert
- **Zirkulation** statt Horten: Anerkennung motiviert Weitergabe
- **Transparenz**: Nutzer sehen, warum sie Vorschläge erhalten

### Technikregeln (neutral & austauschbar gedacht)
- Kleine, überprüfbare PRs. Tests zuerst. Kein Vendor-Lock
- Nur permissive Lizenzen (MIT/BSD/Apache-2.0/ISC)
- Sicherheits- & A11y-Checks mitdenken (Form-Labels, Fokus, semantische HTML-Struktur, simple Rate-Limits)
- Internationalisierung: DE/EN; klare, kurze Texte; Platzhalter vermeiden

### Qualität & Dokumentation
- Jede PR: kurze Begründung, Akzeptanzkriterien, Screenshots/GIFs wenn UI
- Changelogs und kurze "How to test"-Abschnitte
- Definition of Ready (DoR): Klarer Zielnutzen, Akzeptanzkriterien, Risiken benannt, Nicht-Ziele gelistet

## Arbeitsweise

### Definition of Done (DoD)
- Akzeptanzkriterien erfüllt
- Tests: Unit + mind. 1 E2E happy path grün
- A11y geprüft (Labels, Tab-Reihenfolge, Kontrast)
- Performance: mobile-first (Lazy-Loading, kleine Bundles)
- Doku/Changelog aktualisiert

### Frontend-Instruktionen (Mobile-first)

#### UX-Prinzipien
- Ein Ziel pro Screen, klare Call-to-Action oben/unten
- 3-Tap-Regel: Start → Questwahl → Bestätigen
- Offline-freundlich: Platzhalter, Retry, kein Datenverlust
- A11y: korrekte Semantik, Labels, sichtbare Fokuszustände

#### UI-Richtlinien
- Tabs unten: Home, Quests, Map, Hubs, Ich
- Karten- und Kamera-Flows sind "first-class"
- Text: kurz, aktiv, wertschätzend

#### Qualitäts-Budgets
- Mobile LCP < 2.5s, Interaktion ohne Ruckler
- Bilder lazy, nur benötigte Daten laden

### Services-Instruktionen (Domäne & Daten)

#### Domänenregeln
- Saubere Aggregatsgrenzen: Profile/Hubs/Quests/Proofs/Wallet/Graph
- Ereignisse statt impliziter Kopplung (QuestAccepted, ProofSubmitted, BuildUpgraded, RewardGranted)
- Idempotenz & Replays berücksichtigen

#### API-Richtlinien
- Klare Ressourcen, sprechende Felder, konsistente Fehler
- Paginierung (Cursor), Filter, Sortierung

#### Sicherheit & Daten
- Prinzip "so wenig wie möglich"; Standort nur grob, Opt-in für Sichtbarkeit
- Logs ohne personenbezogene Rohdaten; Korrelation über Request/Trace-IDs

## Sprint-Vorgehen

### Sprint 01 – Minimal Slice (PWA Shell + Identity + Profil + Dummy-Quest)
**Ziel**: Installierbare mobile App-Shell mit Login, einfachem Profil-Setup und einer Dummy-Quest (Client-seitig)

**Akzeptanzkriterien**
- Startbildschirm mit Tabs: Home, Quests, Map, Hubs, Ich
- Login-Flow vorhanden; nach Login kurzer Profilwizard (Name, Region)
- Eine Dummy-Quest: anzeigen → annehmen → als "erledigt" markieren
- A11y: alle Formfelder beschriftet, Fokus-Navigation schlüssig
- Kurze Doku "How to run & test"; MIT-Lizenzdatei im Repo

**Vorgehen**
1. Plan + Dateiübersicht vorschlagen, Risiken nennen
2. PR 1: Grundstruktur + App-Shell + Routing + Tests (leer/Smoke)
3. PR 2: Login + Profilwizard + Tests
4. PR 3: Dummy-Quest-Flow (Client-State) + Tests
5. PR 4: README/Doku + kleine A11y-Politur

**Hinweise**
- Kleine PRs (≤150 Zeilen Diff), Tests zuerst
- Keine GPL/AGPL-Dependencies

### Laufende Sprint 03 Fokuspunkte (Graph & Empfehlungen)
Kurzziel: Explainable Recommendations + angereicherter Graph Snapshot + 3D POC hinter Flag.

Priorisierte kleine PR Strecken (Reihenfolge optimiert für Entkopplung):
1. Shared Graph Types Erweiterung (diversityTags, bridgeScore, activityScore Defaults) – Tests für Defaults.
2. Graph Service Map Snapshot angereichert (bereits begonnen) + Test (Meta Felder, Defaults) – DONE teilw. weiterführen.
3. Home: "Heute dran..." Placeholder Komponenten + Mock-Reasons (bridge/diversity/continuation) + i18n Keys (DE/EN).
4. Recommendation Reason Codes Erklärung (Mapping -> i18n) + Unit Test pro Code.
5. GitHub Adapter: Pagination (cursor param) + defensive Rate Limit Handling (Retry-After respektieren) + Tests (Mock Fetch).
6. OAuth2 Spec Draft finalisieren (Endpoints, State, PKCE Hinweis, Persist Layer Interfaces) – Markdown.
7. Sync Pipeline v1 Draft (ETag / If-None-Match contract) – Markdown + minimal util Stub.
8. 3D Graph POC Component (feature flag VITE_ENABLE_GRAPH_3D) + Fallback 2D/List; smoke test rendering.
9. Graph-UI Guidelines Doc: Interaktion, Node Typ Farben, Fokus / Kontext.
10. Telemetry Events Schema: graph_node_focus, recommendation_explained – add to telemetry types + test.
11. Metrics Definition: FPS sampling util + threshold-based downgrade hook (stub + test).

Qualitäts-Checks je PR:
- Unit + vorhandene E2E happy path grün.
- A11y: Labels / Rollen für neue Komponenten.
- Keine neuen Peer-Dependency Warnings (three ggf. Update Ticket separate).

### Vorausplanung Sprint 04 (Seed Backlog)
Nicht umsetzen in Sprint 03 außer Abhängigkeiten: Hubs Data Model, OAuth2 Implementierung, GitHub Sync Polling, LOD Performance Pass.

Definition "Ready" für diese Items: Datenmodell skizziert, Akzeptanzkriterien & Risiken (Performance, A11y) dokumentiert.

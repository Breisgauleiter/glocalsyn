# Syntopia – Development Roadmap

## Phase 1: Minimal Viable Product (Sprints 1-3)

### Sprint 01 – Minimal Slice
**Zeitrahmen**: 2 Wochen  
**Ziel**: Installierbare PWA-Shell mit Basic-Identity und Dummy-Quest

#### Deliverables
- PWA-Shell mit Tab-Navigation (Home, Quests, Map, Hubs, Ich) – [DELIVERED: App-Shell]
- Login-Flow + minimaler Profilwizard – [DELIVERED]
- Eine funktionsfähige Dummy-Quest (Client-seitig) – [DELIVERED]
- Tests: E2E Happy Path – [DELIVERED]; Unit-Tests – [DELIVERED]
- Dokumentation: „How to run & test“ – [DELIVERED]
- Klarstellung: Sacred Geometry nur als Design-System (keine Gameplay-Features)

### Sprint 02 – Quests V1
**Zeitrahmen**: 3 Wochen  
**Ziel**: Erstes lauffähiges Quest-System mit Nachweisen und Belohnungen

#### Deliverables
- Quest-Liste mit Kategorisierung (Daily/Weekly/Story) – DELIVERED
- Detailansichten mit Aufwandsindikatoren – DELIVERED
- Mindestens 3 Nachweisarten (Check-in, Foto, Peer-Bestätigung) – DELIVERED
	- Check-in: instant (legacy „complete“ alias) – DELIVERED
	- Foto: client-seitige Speicherung (DataURL, verkleinert) – DELIVERED
	- Peer-Bestätigung: Einreichung + Review-Flow – DELIVERED
- XP-System und Badge-Belohnungen – DELIVERED (per Proof-Typ skaliert)
- Review-Queue für Nachweise (Proof Verifier Rolle) – DELIVERED (Filter: all/photo/peer/text/link, Typ-spezifisches Rendering)
 - Proof-Regeln (SCL 1–3): Abschluss der Quest genügt (Client‑Proof, datensparsam) – DELIVERED


### Sprint 03 – Graph & Empfehlungen (ArangoDB TAO)
**Zeitrahmen**: 3 Wochen  
**Ziel**: Intelligente Vorschläge basierend auf Graph-Analyse mit ArangoDB (TAO-Modell)

#### Deliverables
- Integration von ArangoDB als Graph-Datenbank (TAO-Modell: Objects & Associations)
- "Heute dran..." Sektion mit 3 personalisierten Empfehlungen
- Erklärbare Empfehlungslogik ("Warum sehe ich das?")
- Brücken-Quest-Priorisierung
- Graph-basierte Vielfaltsmechaniken
- Start: GitHub‑Quests (SCL ≥ 4) – Account‑Link Flow (Opt‑in) + Quest‑Source‑Adapter (GitHub Issues, read‑only)
- Vorbereitung GitHub OAuth2 (Authorization Code Flow): Architektur & Endpoint-Spezifikation (`/auth/github/start`, `/auth/github/callback`), sichere Token-Speicherung (keine PATs im Client)
- Aufstiegs‑Quest zu SCL 4 vorbereitet (Repo‑Verknüpfung als Quest)
	- Aufstiegs‑Proof zu SCL 4: erfolgreiche Verknüpfung des Syntopia‑Accounts mit dem GitHub‑Account
	- Proof‑Regeln (SCL ≥ 4): Nachweis = erfolgreich gereviewter PR, der das zugehörige Issue schließt (automatisch synchronisiert)
	- Issue→Quest Pipeline: Issues aus den Repos „Syntopia“ (später auch „GLOCALSPIRIT“) füllen die Quests; Quelle (Repo/Issue) und Status werden angezeigt
 - 3D Graph Map POC (react-force-graph-3d oder Alternative) – Visualisierung der Knoten: User, Quests, Hubs (progressive enhancement, Low‑Spec Fallback 2D / vereinfachte Liste)
 - Basis-Konzept „Graph-First UI“ dokumentiert (Richtlinien für ersetzbare Listen → interaktive Netzwerke)


#### Fortschritt (13.08.2025)
- Account‑Link Flow (Opt‑in) [DELIVERED]
- Read‑only GitHub Issues Adapter [DELIVERED] (Feature‑Flag: VITE_USE_GITHUB_ADAPTER, default off)
- Repo‑Auswahl UI (mehrere Repos, Persistenz im Profil) [DELIVERED]
- UI Quests: Source‑Badges, persistente Filter, leere Zustände mit CTA [DELIVERED]; Proof‑Typen Check‑in, Text, Link, Foto, Peer konsolidiert
- Review‑Queue: Proof‑Typ Badges, Filter, Foto‑Vorschau, Peer‑Notiz [DELIVERED]
- Proof‑Semantik: XP & Badge Progression erweitert (Legacy 'done' Normalisierung, Reviewer / Threshold Badges) [DELIVERED]
- Test-Infrastruktur gehärtet: speicherstabiles per‑File Runner, konsolidierte QuestDetail Flows, Coverage (v8) sequentiell, neue questStore Tests (Approve/Reject, XP/SCL, Badges) [DELIVERED]
- Doku aktualisiert (GETTING_STARTED, TESTING) mit Env‑Flags & Coverage Nutzung [DELIVERED]
 - Graph-First UI Initiative: Evaluierung 3D-Force-Libs (react-force-graph-3d, drei.js basierte Optionen) [PLANNED]
 - Accessibility & Performance Leitplanken für 3D: Fallback-Strategie skizziert (SSR-Liste / 2D Force) [PLANNED]

#### Update (14.08.2025)
- Auth: Magic‑Link Dev‑Token E2E hinzugefügt (Login → Token → Wizard → Quests) [DELIVERED]
- Cleanup: Duplikat `authStore.tsx` entfernt (nur `authStore.ts` bleibt) [DELIVERED]

Sprint 03 Restarbeiten (kleine PRs – Fokus auf Graph & Empfehlungen):
1. TAO-Graph-Modell Verfeinerung: shared/types Erweiterung (bridgeScore, diversityTags, activityScore Defaults) + Service Endpoints (Map Snapshot angereichert) [DONE]
2. "Heute dran..." Empfehlungen Placeholder (Home) + Live Fetch + ETag Cache + E2E Test [DONE]
3. Pagination & Limit + defensive Rate-Limit-Handhabung im GitHub Adapter (cursor-first) [DONE]
4. Semantik: Vorbereitung PR→Issue Close Mapping (Proof Voraussetzung ab SCL ≥ 4, read‑only Phase) [STUB ADDED]
5. I18n: DE/EN Strings für neue Graph/Empfehlungs-UI + Reason Codes [DONE]
6. OAuth2 Spezifikation konkretisieren (Start/Callback Endpoints, State, Token Persist Layer) – Draft fertigstellen [DONE]
7. Sync Pipeline v1 Draft: Polling Contract (ETag, If-None-Match) + Delta Merge Strategie + util Stub [DONE]
8. Optional: Memory Profiling Ticket (Pfad zurück zu parallelem Vitest falls stabil) [OPEN]
	- Draft ticket created (docs/MEMORY_PROFILING_TICKET.md) [DONE]
9. 3D Graph Map POC implementieren (Feature-Flag `VITE_ENABLE_GRAPH_3D` + Fallback Rendering testen) [PARTIAL – Downgrade + Fallback + FPS Test]
10. Graph-UI Guidelines Markdown anlegen (Interaktionsprinzipien, Node-Typ Farben, Fokus-/Kontext-Modus) [DONE]
11. Messpunkte definieren: FPS (≥ 50 Ziel mobil), Initial Payload Budget, Node Count Threshold für Auto-Downgrade [PARTIAL – Sampler + Downgrade Test]
12. Telemetry Dispatcher (buffer + periodic flush) [DONE]
13. Profile Endpoint + Client ETag Hydration (name) [DONE]
14. Semantic PR→Issue Suggestion Utility (heuristic) [DONE]

Sprint 04 Seed Backlog (Hubs & Lokale Partner – vorbereitet während Abschluss Sprint 03):
1. Hub-Directory Datenmodell (Region, Tags, Capacity) + Indexe
2. Hub Listing UI (Mobile-first, Suche + Filter) mit Graph-Fallback (Liste) & optional Graph Overlay
3. Partner-Verknüpfung (Proof Validierungsrolle) – Rollenmodell Erweiterung
4. Erste Hub-spezifische Quests (belongs_to Edges + UI Badge)
5. Performance Pass: Level-of-Detail (LOD) / Auto-Downgrade Schwellenwerte aus Messpunkten anwenden
6. OAuth2 Implementierung (Code Flow) basierend auf spezifiziertem Draft – minimaler Token Store, Link/Unlink Audit Events
7. GitHub Sync v1 (Polling) – Issue Delta Import + Quest Aktualisierung
8. Review-Queue Erweiterung: Filter nach Hub / Partner
9. Telemetry Events für graph_node_focus & recommendation_explained (Tracking Erfolgs-KPIs)
10. A11y Audit der neuen Graph- & Empfehlungskomponenten (Tab Reihenfolge, ARIA Roles, Fokus-Indikatoren)

## Phase 2: Community Features (Sprints 4-6)

### Sprint 04 – Hubs & Lokale Partner
- Hub-Directory mit Bewertungen
- Partner-Integration für Quest-Validierung
- Lokale Ereignisse und Challenges
 - 3D/2D Hybrid: Hubs-Verzeichnis als Graph (Hubs ↔ Quests ↔ Regionen) mit Such-/Filter-Overlay (Fallback: tabellarische Liste)
 - Performance Pass: Level-of-Detail (LOD) Rendering für große Hub-Netze

### Sprint 05 – Social Layer + Governance V1
- Peer-to-Peer Quest-Empfehlungen
- Team-Quests und Gruppenbelohnungen
- Community-Boards pro Region
- Governance V1: 12 Rollen definieren, SCL‑Gates, einfache Rollenvergabe-UI
 - Social Graph Overlay: Kontakte / Peers / Review-Beziehungen als interaktive Netzwerkansicht (ersetzt statische Kontaktliste)
 - Moderations-/Governance Beziehungsgraph (Rollen-Knoten, Verantwortungs-Kanten)

### Sprint 06 – Gamification V2 + Rollen-Workflows
- Fortgeschrittenes Belohnungssystem
- Seasonal Events und Themenmonate
- Leaderboards mit Fairness-Fokus
- Review-Queues mit Audit-Log (Proofs, Content), Eskalation
 - Leaderboard-zu-Netzwerk Visualisierung (Cluster nach Rolle / Region) + Influenz-Propagations-Preview (Simulation Light)

## Phase 3: Scale & Polish (Sprints 7-9)

### Sprint 07 – Performance & Offline
- Erweiterte Offline-Funktionalität
- Performance-Optimierung für schwächere Geräte
- Sync-Strategien für schlechte Netzwerke

### Sprint 08 – Accessibility & I18n
- Vollständige A11y-Compliance
- Mehrsprachigkeit (DE/EN als Start)
- Voice-Navigation für Screen Reader

### Sprint 09 – Analytics & Growth + Community Ops
- Anonymisierte Nutzungsanalyse
- A/B-Testing Framework
- Onboarding-Optimierung
- Community Ops Playbooks für 12 Rollen (How‑to, Checklisten)

## Langzeitvision: GitHub‑Quests ab SCL ≥ 4
- Start ab Sprint 03: Quests aus echten GitHub‑Issues (Feature/Fix) – zunächst read‑only Adapter + Account‑Link Flow.
- Aufstiegs‑Quest zu SCL 4: Verknüpfe dein Syntopia‑Profil mit einem GitHub‑Repository (Opt‑in, transparent, widerrufbar).
- Erklärbarkeit: Anzeige der Quelle (Repo/Issue) und des Grundes für die Empfehlung.
 - Pipeline: Syntopia‑ und GLOCALSPIRIT‑Issues → Syntopia‑Quests; das Erledigen via PR‑Merge/Issue‑Close lässt beide Repos und das Quest‑Angebot wachsen.
 - Proof‑Zusammenfassung: SCL 1–3 = Questabschluss (Client‑Proof); ab SCL 4 = verknüpfter GitHub‑Account + gereviewter PR, der das Issue schließt.

### GitHub OAuth & Sync Roadmap (Detail)
1. OAuth2 Einführung (Sprint 03): Backend Endpoints + state-Verifizierung + minimaler Token-Store (Access Token, optional Refresh falls Fine-Grained Tokens genutzt)
2. Repo-Auswahl UI (Ende Sprint 03): Liste der Repos (nur notwendige Felder), persistierte Auswahl pro User
3. Sync v1 (Sprint 04): Polling mit Conditional Requests (ETag, Last-Modified) → Quest Deltas (Neu, Aktualisiert, Geschlossen)
4. Proof-Automation v1 (Sprint 04): Wenn PR merged & Issue geschlossen → Quest auto markCompleted + XP
5. Webhooks Migration (Sprint 05): Issue & PR Events → Push-basiert statt Polling; Fallback Polling als Backup
6. Sicherheits-Härtung: Token Rotation, Scope Minimierung, Audit-Log (Link/Unlink) (Sprint 05)
7. Contributor Feedback Loop: Optional Kommentar auf Issue bei Quest-Annahme / Completion (Opt‑in) (Sprint 06)

Status (11.08.2025): Read‑only Adapter in App verdrahtet (Feature‑Flag: VITE_USE_GITHUB_ADAPTER), Repos via VITE_GITHUB_REPOS; Standard: off. Unit+E2E abgedeckt, CI grün. Nächster Meilenstein: selektive Repo‑Verknüpfung und verbesserte Proof‑Semantik.

## Cross-Cutting Initiative: Graph-First UI (Lists → Networks)
Ziel: Wo immer Beziehungen Mehrwert stiften (Kontakte, Gruppen, Quests, Hubs, Reviews), klassische Listen durch interaktive Graphrepräsentationen (3D bevorzugt, 2D/Listen-Fallback) zu ergänzen oder zu ersetzen.

### Prinzipien
1. Progressive Enhancement: 3D nur wenn Gerät/Browser-Fähigkeiten (WebGL2, ausreichende FPS) erkannt
2. Erklärbarkeit: Hover / Fokus zeigt Kanten-Typen (z.B. "reviewed", "belongs_to", "continues", "bridge")
3. Reduzierte Knotenlast: Virtualisierte/clustered Darstellung > X Nodes (Hierarchie / Community Detection)
4. A11y-Pfad: Tastatur-Navigation (Tab sequence der fokussierbaren Nodes) + ARIA-Region mit Listen-Äquivalent
5. Performance Budgets: Initial < 120KB gzipped Graph-UI Bundle; Mobile LCP < 2.5s

### Phasen
- POC (Sprint 03): Map 3D Graph (User/Quest/Hub) + Fallback
- Hybrid (Sprint 04): Hub Directory Graph Overlay + Filter
- Social Expansion (Sprint 05): Kontakte & Peer-Review Beziehungen
- Governance (Sprint 05/06): Rollen & Moderationsnetz
- Gamification (Sprint 06+): Influence / Propagation Simulation Light

### Technologiekandidat
Primär: react-force-graph-3d (Three.js basierend) – Gründe: Stabil etablierte API, Force-Engine konfigurierbar, VR/AR Erweiterbarkeit. Alternativen im Evaluations-Doc: sigma.js (2D), d3-force + custom Three Layer (höherer Wartungsaufwand), vivagraph.
### Tasks (laufend)
- Library Evaluation Report (FPS Benchmarks, Memory Profiling)
- Fallback Strategy Component (GraphFallbackList)
- Node/Edge Typing Schema (shared/types/graph) Erweiterung (z.B. edge.reason, weight, diversityScore)
- Color & Shape Mapping (A11y Kontrast, Color-Blind Paletten)
- Interaction Contracts: click (focus), double-click (expand neighbors), long-press (mobile radial menu)
- Telemetry Events: graph_node_focus, graph_edge_explain

### Risiken
- Mobile GPU Throttling → dynamische Quality Scaling nötig
- A11y Komplexität → Muss immer semantisch äquivalente Liste bieten
- Potentiale kognitive Überlast → Progressive Disclosure (Depth Limits, Fokus-Modus)

### Erfolgskriterien (Metriken)
- ≥ 95% der unterstützten Geräte liefern > 45 FPS bei 200 Knoten / 400 Kanten
- Nutzer verstehen (Umfrage) "Warum sehe ich diese Empfehlung" (>80% Zustimmung)
- Kein Anstieg von Abbruchraten in den Flows (Quest-Annahme) nach Graph-Einführung
## Meilensteine
- **M1** (Ende Sprint 3): MVP lauffähig, erste 100 Beta-Tester
- **M2** (Ende Sprint 6): Community-Features aktiv, 1000 aktive Nutzer, Governance V1 aktiv
- **M3** (Ende Sprint 9): Skalierungsreif, Public Launch vorbereitet

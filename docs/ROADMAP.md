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


#### Fortschritt (12.08.2025)
- Account‑Link Flow (Opt‑in) [DELIVERED]
- Read‑only GitHub Issues Adapter [DELIVERED] und hinter Feature‑Flag verdrahtet (default: off)
- UI für Quests: Source‑Badges, Filter (persistiert), leere Zustände mit CTA [DELIVERED]; neue Proof‑Typen in Detail‑UI (Check‑in, Text, Link, Foto, Peer)
- Review‑Queue: Proof‑Typ Badges, Filter, Foto‑Vorschau, Peer‑Notiz [DELIVERED]
- Tests: Unit + E2E grün; CI‑Workflow grün [DELIVERED]
- Doku: GETTING_STARTED mit Env‑Flags (VITE_USE_GITHUB_ADAPTER, VITE_GITHUB_REPOS, optional TOKEN, LIMIT) [DELIVERED]

Nächste Schritte (kleine PRs):
- TAO-Graph-Modell in shared/types und Backend: ArangoDB Collections für Objects (user, hub, quest) und Associations (follows, joins, recommends)
- Repo‑Auswahl‑UI (mehrere Repos, Opt‑in je Repo)
- Pagination/Limit für Adapter, defensive Rate‑Limit‑Handhabung
- Semantik: PR→Issue‑Close‑Erzwingung für Proofs ab SCL ≥ 4 (read‑only bleibt vorerst bestehen)
- I18n: DE/EN Texte für neue UI‑Elemente
 - GitHub OAuth2 Implementierung (Sprint 03→04 Übergang): Backend Redirect & Callback, Token-Exchange, Verschlüsselung at rest, Logout/Token Revoke
 - Repo-Auswahl nach OAuth: Abruf user/org Repos via API (paginierend) + Opt‑in pro Repo, Speicherung minimaler Metadaten
 - Sync Pipeline v1: Periodisches Polling (ETag) für Issues der verknüpften Repos → Quest-Refresh (Delta-basiert)
 - Webhook-Vorbereitung (optional): Konfigurationsentwurf für spätere Echtzeit-Sync (Issue events, Pull Request events)

## Phase 2: Community Features (Sprints 4-6)

### Sprint 04 – Hubs & Lokale Partner
- Hub-Directory mit Bewertungen
- Partner-Integration für Quest-Validierung
- Lokale Ereignisse und Challenges

### Sprint 05 – Social Layer + Governance V1
- Peer-to-Peer Quest-Empfehlungen
- Team-Quests und Gruppenbelohnungen
- Community-Boards pro Region
- Governance V1: 12 Rollen definieren, SCL‑Gates, einfache Rollenvergabe-UI

### Sprint 06 – Gamification V2 + Rollen-Workflows
- Fortgeschrittenes Belohnungssystem
- Seasonal Events und Themenmonate
- Leaderboards mit Fairness-Fokus
- Review-Queues mit Audit-Log (Proofs, Content), Eskalation

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

## Meilensteine
- **M1** (Ende Sprint 3): MVP lauffähig, erste 100 Beta-Tester
- **M2** (Ende Sprint 6): Community-Features aktiv, 1000 aktive Nutzer, Governance V1 aktiv
- **M3** (Ende Sprint 9): Skalierungsreif, Public Launch vorbereitet

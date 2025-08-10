# Syntopia – Technical Architecture

## Architektur-Prinzipien

### MIT-first & Vendor-Lock Vermeidung
- Alle Core-Dependencies MIT/BSD/Apache-2.0/ISC lizenziert
- Austauschbare Service-Layer (Database, Auth, Storage)
- Keine proprietären Cloud-Dienste im kritischen Pfad

### Mobile-first Design
- Progressive Web App (PWA) als primäre Platform
- Offline-first mit Service Worker
- Responsive Design mit Mobile-Breakpoints als Standard

### Modulare Domain-Architektur
```
apps/
  app/                 # Main PWA Client
services/
  profile/             # Identity & User Management
  quests/              # Quest Logic & State
  hubs/                # Local Partner Management
  graph/               # Social Graph & Recommendations
  proofs/              # Evidence Validation
  wallet/              # Rewards & Achievements
  governance/          # Roles, Permissions, Review Queues
shared/
  types/               # TypeScript Domain Types
  utils/               # Common Utilities
  ui/                  # Shared UI Components
```

## Technology Stack

### Frontend (apps/app/)
- **Framework**: React 18 mit TypeScript
- **State**: Zustand für Client-State, React Query für Server-State
- **UI**: Tailwind CSS + Headless UI (A11y-ready)
- **PWA**: Vite PWA Plugin
- **Testing**: Vitest + React Testing Library + Playwright
- Sacred Geometry: Nur als Design-Token/Assets (Proportionen), kein Feature Flag, keine Logik.

### Services (services/*)
- **Runtime**: Node.js mit TypeScript
- **Framework**: Fastify (MIT-lizenziert, performant)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: Lucia Auth (Session-based, MIT)
- **File Storage**: Local FS mit S3-kompatibler Abstraktion

### Shared Infrastructure
- **Monorepo**: Turborepo für Build-Orchestrierung
- **Package Manager**: pnpm für Effizienz
- **Code Quality**: ESLint + Prettier + TypeScript strict
- **CI/CD**: GitHub Actions

## Data Architecture

### Core Entities
```typescript
// Domain Models (simplified)
interface User {
  id: string;
  displayName: string;
  region?: string;
  preferences: UserPreferences;
  currentSCL: number; // 1..25
  roles: CommunityRole[];
  createdAt: Date;
}

interface CommunityRole {
  key:
    | 'quest_designer'
    | 'proof_verifier'
    | 'reward_curator'
    | 'hub_steward'
    | 'community_ambassador'
    | 'cartographer'
    | 'graph_analyst'
    | 'profile_guide'
    | 'ux_maintainer'
    | 'infra_operator'
    | 'product_maintainer'
    | 'code_maintainer';
  minSCL: number; // SCL gate
}

interface RoleAssignment {
  userId: string;
  role: CommunityRole['key'];
  grantedBy: string;
  grantedAt: Date;
}

interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'story';
  requirements: ProofRequirement[];
  rewards: Reward[];
  difficulty: 1 | 2 | 3;
  minimumSCL?: number; // gate sensitive quests
}

interface Proof {
  id: string;
  questId: string;
  userId: string;
  type: 'checkin' | 'photo' | 'peer_confirmation';
  data: ProofData;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string; // role: proof_verifier
  reviewedAt?: Date;
}
```

### Governance Flows
- Rollenvergabe via Review‑Request; mind. 1 Bestätigung durch Code/Product Maintainer (ab SCL ≥ X).
- Nachweis‑Review Queue mit Eskalationspfad und Audit‑Trail.
- Konfigurierbare SCL‑Gates pro Feature/Endpoint (Idempotent, server‑seitig durchgesetzt).

### Graph Model
- **Nodes**: Users, Hubs, Quests, Skills
- **Edges**: Connections, Completions, Recommendations, RoleAssignments
- **Eigenschaften**: Weighted für Empfehlungsalgorithmen und Brücken‑Heuristik

## Security & Privacy

### Datenschutz by Design
- Opt-in für alle Standort- und Social-Features
- Pseudonymisierung von Analytics-Daten
- GDPR-konforme Datenexporte und Löschungen

### Security Measures
- Rate Limiting auf API-Level
- Input Validation mit Zod Schemas
- CSRF Protection für State-Changing Operations
- Content Security Policy für XSS-Schutz

## Deployment Strategy

### Development
- Local Docker Compose für Services
- Hot Reload für Frontend Development
- In-Memory Database für Tests

### Staging/Production
- Container-basiert (Docker)
- Database Migrations via Prisma
- Feature Flags für schrittweise Rollouts

## Testing Strategy

### Unit Tests
- Services: Domain Logic isolated
- Frontend: Component Logic + Custom Hooks
- Shared: Utility Functions

### Integration Tests
- API Contract Tests zwischen Services
- Database Query Performance Tests

### E2E Tests
- Critical User Journeys (Onboarding → Quest → Reward)
- Cross-Browser Testing via Playwright
- A11y Testing mit axe-core

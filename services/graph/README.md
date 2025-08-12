# Graph Service (ArangoDB + TAO)

Minimal bootstrap service for the Syntopia social graph.

## Features
- Ensures database & collections (`graph_objects`, `graph_edges`)
- Upsert objects (user | hub | quest)
- Create edges (follows | joins | recommends)
- Basic recommendation query

## Env
```
ARANGO_URL=http://localhost:8529
ARANGO_DB=syntopia
ARANGO_USER=...
ARANGO_PASS=...
```

## Dev
Install root deps then:
```
pnpm --filter @syntopia/graph-service dev
```

## Build
```
pnpm --filter @syntopia/graph-service build && pnpm --filter @syntopia/graph-service start
```

## Next
- Add authentication / API layer
- Expose GraphQL or REST endpoints
- Event sourcing for quest progression

# 11. Cross-referencing neuris documents

Date: 2025-09-12

## Status

Draft

## Context

🚧 The issue motivating this decision, and any context that influences or constrains the decision.🚧 

NeuRIS must support cross-references between documents of heterogeneous types (e.g., caselaw, administrative directives) that are owned by different teams and reside in separate schemas for domain isolation.

Two reference directions must be represented:

- **Active References (Aktivzitierung)**: Explicit links created by a source document to a target.
- **Passive References (Passivzitierung)**: Implicit links indicating a document has been referenced by another source.

#### Requirements & Constraints:

- Referential integrity must be maintained, even across schema boundaries.
- Streams should have read/write access to references but read-only access to other streams document tables.
- The application should be testable in isolation, without relying on a remote shared database.
- CI/CD pipelines must be able to spin up a local environment (e.g., via Docker) with all necessary schemas and tables.

## Decision

🚧 The change that we're proposing or have agreed to implement.🚧 

- To represent references in both directions, even across domains, a central reference table will be introduced: `ris_references` in a shared schema with read and write access for each stream
- In this shared schema, a central registry table will be introduced which will hold the identifiers for all documents across streams.
- Each stream-specific schema will maintain its own documents table for storing its document data, and will have read-only access to other streams documents tables.
- For local development and CI/CD, the Docker initialization process will create:
  - The shared schema with both the central registry and `ris_references` tables.
  - All domain-specific schemas and their documents tables with seed data.

## Consequences

🚧 What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.🚧 

### Benefits:
- The central reference table act as the source of truth for all references and can be accessed by all streams
- Referential integrity is preserved via the central registry table
- Domain isolation preserved: Document ownership stays within its respective schema.
- Simplified local testing: CI/CD can spin up all schemas locally without needing remote services.

### Risks:
- Concurrency issues: Multiple streams writing to `ris_references` could create race conditions without proper locking or transactional handling.
- Access control complexity: Granting read/write to multiple teams may increase the risk of misconfiguration or accidental modification.

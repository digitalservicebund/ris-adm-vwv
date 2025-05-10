*Note: There is a related ADR ([0007-dealing-with-published-documents](./0007-dealing-with-published-documents.md)) which details how the below is meant to work out for use cases related to published documents.*

# 4. Data Persistence and Data Exchange

Date: 2025-02-11

## Status

Accepted

## Context

When our users document administrative directives, document data flows

- from the user's browser
- to our web application's backend (database) and from there
- to the portal

With respect to the portal, there is a NeuRIS agreement to serve XML/LDML files. And as the frontend is based on TypeScript and uses `pinia` for local persistence, JSON is a natural choice for any data handled there.

Hence the question arises at which point in the flow of data we make the switch between JSON and XML/LDML.

## Decision

- The step of "publishing" a document is the point where JSON becomes XML/LDML.
  - Accordingly, reading a published document is where XML/LDML becomes JSON again in order to be handled by the frontend.

- In the frontend, the documents are handled as JSON objects.
- Data exchange between frontend and backend happens in JSON.
  - Frontend and backend will exchange documents in one piece. There are no "partial updates".
  - We allow for these documents to be "incomplete" in the sense that they may be missing information which is required by the XML/LDML schema it will eventually be transformed to.
- In the backend, the documents are stored
  - as JSON _before they are published_ and
  - as XML/LDML _after they have been published_.
- The publication step requires the XML/LDML structures to be valid wrt. their schemas. Otherwise publication is rejected. 
- To the portal, the documents are sent as XML/LDML.
- In all these places, besides the plain documents, there will probably be additional data in order to support use cases around these documents (e.g. process information data, HTML renderings of the XML/LDML or similar).
- The backend database is understood as the single point of truth in our system.

## Consequences

- No XML handling in the frontend.

  - The frontend does not interpret or transform any XML.
  - This means we're staying with data types that the frontend stack is familiar with, which simplifies development (no XML libraries, no XML tooling, no XML concepts).
  - This does not rule out use cases involving the frontend to pass XML/LDML from/to the backend like it does with other (binary) data like images or PDF files. The crucial point is that all XML/LDML manipulation is done in the backend. The frontend never interprets XML/LDML.

- The API endpoints talking JSON exclusively reduces complexity and matches the modern web stack.

- Exchanging documents "in one piece" reduces complexity by reducing the number of models and behaviors to be covered.
  - We do not expect the size of the data exchanges to have a significant impact on the user experience.

- The backend being the only place where transformations between JSON and XML/LDML happens matches our Java/Spring backend stack.

- Only valid XML/LDML will reach the database, so all XML/LDML read from the database can be relied on being valid.

- As the backend's database is the single source of truth, our web application's data is covered by the NeuRIS backup plan.

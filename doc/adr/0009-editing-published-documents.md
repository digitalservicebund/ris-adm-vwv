# 9. Editing Published Documents

Date: 2025-06-26

## Status

Accepted

## Context


Here's the mental model our application should support with respect to editing published documents:

- Every document exists only once.
- That document is either public or not.
- The document can be edited in either state.
- In case the document is public, the changes are also public (maybe with a technical delay)
- The user decides when their change is applied to the document.

Another constraint is more technical in nature:

- We currenty store frontend state as JSON, published document state as XML
- The XML contains data that the JSON does not.
- Therefore translating from XML to JSON looses data.

So how do we map these requirements to our backend architecture?

Also, given the chosen architecture: how to determine (from the database) if a document is published or not?

## Decision


- We stay with the current architecture:

  - JSON for frontend state,
  - XML for published document state.

- We stay with the requirement that all stored XML is always valid wrt. our schema.

- We do not allow the JSON and XML to diverge (where they overlap) and here's how we do it:
  - If a document is not published, then
    - there's only the JSON
    - if it's edited in the frontend and saved, the JSON gets updated
  - If a document is published, then
    - we have both, the JSON and the XML and they are in sync (where they share data)
    - if it's edited in the frontend and the user tries to re-publish,
      - we validate the data and
      - if it's invalid wrt. our schema, we reject the re-publishing and neither JSON nor XML are changed
      - if it's valid wrt. our schema, we update both the JSON and the XML

## Consequences


- We accept

  - the duplication of data between JSON and XML and
  - the inherently higher complexity in code

- in favor of

  - keeping the benefits of the existing architecture (cf. [doc/0004-data-persistence-and-exchange](./0004-data-persistence-and-exchange.md)),
  - keeping refactoring low wrt. the existing solution and
  - keeping the requirement in place that all XML in our database is valid wrt. our schema.

- The use case of "un-publishing" or "retracting" documents is not covered, yet, as it's no requirement so far.

  - Therefore, the existence of XML is equivalent to the document being published. 
  - This means that there is no separate discriminator like an "isPublished" field.

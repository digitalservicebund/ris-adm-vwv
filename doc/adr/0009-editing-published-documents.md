# 9. Editing Published Documents

🚧 Date: 202x-xx-xx

## Status

🚧 Proposed (Accepted)

## Context

🚧 The issue motivating this decision, and any context that influences or constrains the decision.

Here's the mental model our application should support with respect to editing published documents:

- Every document exists only once.
- That document is either public or not.
- The document can be edited in either state.
- In case the document is public, the changes are also public (maybe with a technical delay)
- The user decides when their change is applied to the document.

Another constraint is more technical in nature:

- We do store frontend state as JSON
- We do store published document state as XML
- The XML contains data that the JSON does not.
  - Translating from XML to JSON looses data.

The question is: how do we map these requirements to our backend architecture?

## Decision

🚧 The change that we're proposing or have agreed to implement.

## Consequences

🚧 What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.

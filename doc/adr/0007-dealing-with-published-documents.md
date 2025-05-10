# 8. Dealing With Published Documents

Date: 202x-xx-xx 👈 update before merging to main

## Status

Draft 👈 make "Accepted" before merging to main

## Context

In ADR [0004-data-persistence-and-exchange](0004-data-persistence-and-exchange.md) we explained the separation of

- JSON data, which is used in
  - used in the frontend
  - used in communication between frontend and backend
  - used for persisting frontend state during the editing of a document
- XML data, which is is used for
  - persisting published documents

What the ADR left open was how we envision

- persistence when in comes to the process of publishing
- persistence when a published document is edited

It also important to know that documents can reach our app in two ways:
- They may be created through our app.
- They may have been imported from a legacy system.


In general, three aspects determine the states we have to handle:

- Publication state: Has the document ever been published?
    - Note: Documents that were not created through the app but imported from a legacy system can be assumed to be published.
- Access through the app: Has the document ever been opened through the app? 
    - Note: The imported ones may not have been.
- Edits after publishing: Has the document been edited since publishing, but not yet published again?



## Decision

- When a document was created in the app and never published,
  - it exists as (persisted) frontend state in JSON
  - does not exist as XML/LDML in DB and is not available to the portal

- When a document was created outside the app and never accessed through the frontend,
  - it does not exist as (persisted) frontend state in JSON
  - it exists as XML/LDML in the database and is available to the portal

- When a document was published through the app or: <br> when it was created outside the app and accessed through the frontend,
  - it exists as (persisted) frontend state in JSON
  - it exists as XML/LDML in the database and is available to the portal

- When a document was published through the app and edited again (but not published again) or: <br> when it was created outside the app and accessed through the frontend and edited again (but not published again):
  - the edited state
    - exists as (persisted) frontend state in JSON
    - does not exist as XML/LDML in the database and is not available to the portal
        - the old state exists in these places

  - the published state (older than the edited state)
    - does not exist as (persisted) frontend state in JSON 
        - the edited state exists in this place
    - exists as XML/LDML in the database and is available to the portal

## Consequences

- Our architecture allows for frontend state and published document to differ.
- We have a strong handle on the specific way they can differ.
- It's a product question how to handle the situation of publishing-then-editing in terms of app behavior and/or UX.
- Technically, we stay flexible and can support many solutions, like
    - e.g. defaulting on the published state: Always show the published state to the user when opening a document.
    - e.g. keeping both versions: Keep diverging documents, but tell the user that they differ.
    - e.g. defaulting on the frontend state: Always publish the edited state.
    - etc.
# 8. Using German Domain Terms

❓❓ Date: 202x-xx-xx

## Status

❓❓ Draft (should become accepted)

## Context

When it comes to domain terms, we have used

- English on the tech side of our project and
- German when it came to communicating within the domain.

This is a sensible default as English is most wide-spread among software engineers.

However, it has lead to misunderstanding and additional work when translating (often: on-the-fly) between those two "worlds".

Alternatively, we could keep domain specific terms in German. 

That approach that is

- recommended within DigitalService ("favor keeping domain-specific terms in German over 'language purity'", cf. [here](https://digitalservicebund.atlassian.net/wiki/x/BgD4WQ)) and
- in line with the concept of a "ubiquitous language" (Domain Driven Design, cf. [here](https://martinfowler.com/bliki/UbiquitousLanguage.html)).

## Decision

We're gradually transforming our solution towards using German domain terms:

- New domain terms will be introduced in German
- Domain terms that already exist in our solution will be replaced over time whenever the current piece of work (story / task) benefits from the corresponding refactoring.

## Consequences

- The tech side of our project will be primarily written in English, but will contain German domain terms.

- This should make communication between tech and domain more easy.

- For non-native speakers of German working on our tech, there needs to be some support for understanding the meaning of the German terms.

- We may not reach the point where all occurrences of English domain terms are replaced as there are places where the benefit would not outweigh the effort.

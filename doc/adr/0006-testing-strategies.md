# 6. Testing Strategies

Date: 2025-02-21

## Status

Accepted

## Context

_[The issue motivating this decision, and any context that influences or constrains the decision.}_

With the introduction of ahttps://github.com/digitalservicebund/ris-adm-vwv/pull/221 backend, our code setup has changed significantly and we need to agree to how we approach testing.

The needs of our team wrt. testing are as follows:

- Tests should only break if the code/application is broken, e.g.
  - they should rather not rely on external factors like infrastructure deficiencies or someone breaking staging.
  - they should rather not be brittle
- Tests should prove that the piece under test behaves as we want it to behave, e.g.
  - browser behavior
  - API behavior
  - unit of code behavior (e.g. function behavior, web controller behavior, persistence behavior)
- Tests should not slow us down significantly, i.e. [change lead time](https://dora.dev/guides/dora-metrics-four-keys/) must be acceptable
- We should not work against our frameworks
  - SpringBoot expects to test application layers in isolation
- Tests should help us infer the place of origin of a malfunction
- We should have means to estimate the size of our blind spots that are not tested

## Decision

_[The change that we're proposing or have agreed to implement.]_

- We run E2E tests against a "full" webapp that interacts with a real backend
  - Backend interactions are not mocked.
  - Our [ADR on E2E in a localhost setup](./0003-localhost-setup-for-e2e-tests.md) stays in effect.
- We have integration tests on the API that operate on a real backend applicaction and database.
  - These tests assure the correct request/response behavior of our API.
  - The inner workings of the API are not mocked ("inner workings" as opposed to 3rd party services)
- We have unit tests on any part of the application that we want to assert behavior on
  - The less "happens" in a unit, the less we need a test
- We prefer to not test implementation but behavior
  - This may be difficult at times as e.g. SpringBoot aims at testing the application "layers" in isolation.
- We prefer tests to be isolated / independent from each other
- We require a test coverage (lines of code) greater than 90%

- We'll apply these rules to new tests/functionality first. Existing tests/functionality will be transitioned over time.

## Consequences

_[What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated.]_

- Infrastructure problems need to be cared for separately, e.g.
  - if we wanted to make sure a migration worked fine on staging before deploying to production.
  - if we wanted to make sure our production backend can reach the production database.
- We will need to adjust our CI/CD configuration wrt. E2E tests as they now demand a working backend.

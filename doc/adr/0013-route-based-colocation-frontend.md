# 0013. Organize frontend code by route

Date: 2025-11-15

## Status

Accepted

## Context

Our project grows and both the components and composables folders grow further. With the current structure it is not clear which things (components, composables) are developed to be shared between multiple places and which are one-of solutions for a specific feature. We therefore, want to increase the colocation of things related to the same feature and make clear which things are shared and used by multiple features.


## Decision

- Keep existing top-level folders (`components/`, `composables/`) for shared code.
- Rename `routes/` to `views/` and name every route component `*.view.vue` to differentiate it from the view specific components.
- Place route-specific components, composables, tests inside the corresponding view folder. Nested routes should import from parent folders but not from siblings/children.
- Update Vitest/Sonar coverage configs to exclude only `*.view.vue`, so colocated components/composables can be unit tested.

```
src
├── components
├── composables
├── domain
├── lib
├── services
├── types
└── views
    ├── adm
    │   └── documentUnit
    │       └── [documentNumber]
    │           ├── useEditableList.ts
    │           ├── ComboboxInput.vue
    │           ├── fundstellen
    │           │   ├── Fundstellen.view.vue
    │           │   └── components
    │           └── rubriken
    │               ├── Rubriken.view.vue
    │               └── components
    ├── literature
    │   ├── Overview.view.vue
    │   ├── DokumentTyp.vue
    │   ├── RisTabs.vue
    │   ├── useLiteratureRubriken.ts
    │   ├── sli
    │   │   ├── Rubriken.view.vue
    │   │   └── components
    │   └── uli
    │       ├── Rubriken.view.vue
    │       └── components
    ├── publication
    │   ├── Abgabe.view.vue
    │   └── Publication.vue
    ├── EditDocument.view.vue
    ├── ErrorNotFound.view.vue
    ├── Forbidden.view.vue
    ├── NewDocument.view.vue
    ├── Overview.view.vue
    └── RootRedirect.view.vue
```

## Consequences

- Route components and their helpers live side by side, and `.view.vue` instantly identifies the entry point for a page.
- Shared folders clearly contain reusable things; domain-specific code stays under its route until it becomes cross-domain.
- As domains grow, we can move newly shared pieces back into the shared layer without changing the route structure.
- If views become very large, we can introduce deeper nesting within their folder.
package de.bund.digitalservice.ris.adm_vwv.application;

import jakarta.annotation.Nonnull;

/**
 * The query business object used for looking up reference types
 *
 * @param searchTerm String to search for in reference types
 * @param queryOptions Details on pagination and sorting
 */
public record ReferenceTypeQuery(String searchTerm, @Nonnull QueryOptions queryOptions) {}

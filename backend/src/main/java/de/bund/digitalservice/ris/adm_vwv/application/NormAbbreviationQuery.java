package de.bund.digitalservice.ris.adm_vwv.application;

import jakarta.annotation.Nonnull;

/**
 * The query business object used for looking up norm abbreviations
 *
 * @param searchTerm String to search for in norm abbreviations
 * @param queryOptions Details on pagination and sorting
 */
public record NormAbbreviationQuery(String searchTerm, @Nonnull QueryOptions queryOptions) {}

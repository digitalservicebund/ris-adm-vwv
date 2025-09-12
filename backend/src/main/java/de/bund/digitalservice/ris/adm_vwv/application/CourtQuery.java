package de.bund.digitalservice.ris.adm_vwv.application;

import jakarta.annotation.Nonnull;

/**
 * The query business object used for looking up courts.
 *
 * @param searchTerm String to search for in courts
 * @param queryOptions Details on pagination and sorting
 */
public record CourtQuery(String searchTerm, @Nonnull QueryOptions queryOptions) {}

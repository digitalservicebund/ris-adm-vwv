package de.bund.digitalservice.ris.adm_vwv.application;

import javax.annotation.Nonnull;

/**
 * The query business object used for looking up document types
 *
 * @param searchTerm String to search for in document types
 * @param paginationDetails Details on pagination and sorting
 */
public record DocumentTypeQuery(String searchTerm, @Nonnull PaginationDetails paginationDetails) {}

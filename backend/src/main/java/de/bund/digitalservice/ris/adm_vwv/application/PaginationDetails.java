package de.bund.digitalservice.ris.adm_vwv.application;

import javax.annotation.Nonnull;
import org.springframework.data.domain.Sort;

/**
 * Query object
 *
 * @param paginationPageNumber Page (of pagination) to return
 * @param paginationPageSize Size of page
 * @param sortByProperty Property to sort by
 * @param sortDirection Direction to sort by
 * @param usePagination {@code true} if result should be paginated, {@code false} otherwise
 */
public record PaginationDetails(
  int paginationPageNumber,
  int paginationPageSize,
  @Nonnull String sortByProperty,
  @Nonnull Sort.Direction sortDirection,
  boolean usePagination
) {}

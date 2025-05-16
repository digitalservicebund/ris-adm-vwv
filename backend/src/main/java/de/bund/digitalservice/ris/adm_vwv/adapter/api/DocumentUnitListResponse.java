package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitListElement;
import org.springframework.data.domain.Page;

/**
 * Response with document unit list elements and pagination information
 *
 * @param paginatedDocumentUnitListElements List of paginated document unit list
 *                                          elements
 */
public record DocumentUnitListResponse(
  Page<DocumentationUnitListElement> paginatedDocumentUnitListElements
) {}

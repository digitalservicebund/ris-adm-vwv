package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.ReferenceType;
import java.util.List;

/**
 * Response with the referenceTypes.
 *
 * @param referenceTypes List of reference types (e.g. anwendung)
 * @param page Pagination data
 */
public record ReferenceTypeResponse(List<ReferenceType> referenceTypes, PageResponse page) {}

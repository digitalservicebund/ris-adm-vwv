package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
import java.util.List;

/**
 * Response with norm abbreviations and pagination information.
 *
 * @param normAbbreviations List of norm abbreviations
 * @param page Pagination data
 */
public record NormAbbreviationResponse(
  List<NormAbbreviation> normAbbreviations,
  PageResponse page
) {}

package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for accessing the {@link NormAbbreviation} resource (lookup table).
 */
@RestController
@RequiredArgsConstructor
public class NormAbbreviationController {

  private final LookupTablesPort lookupTablesPort;

  /**
   * Return norm abbreviations (optionally with search term, pagination, sorting)
   *
   * @param searchTerm Keyword to restrict results to.
   * @param pageNumber Which page of pagination to return?
   * @param pageSize How many elements per page in pagination?
   * @param sortByProperty Sort by what property?
   * @param sortDirection Sort ascending or descending?
   * @param usePagination Search with pagination?
   *
   * @return Response object with list of norm abbreviations and pagination information
   */
  @GetMapping("api/lookup-tables/norm-abbreviations")
  public ResponseEntity<NormAbbreviationResponse> getNormAbbreviations(
    @RequestParam(required = false) String searchTerm,
    @RequestParam(defaultValue = "0") int pageNumber,
    @RequestParam(defaultValue = "4") int pageSize,
    @RequestParam(defaultValue = "type") String sortByProperty,
    @RequestParam(defaultValue = "ASC") Sort.Direction sortDirection,
    @RequestParam(defaultValue = "true") boolean usePagination
  ) {
    QueryOptions queryOptions = new QueryOptions(
      pageNumber,
      pageSize,
      sortByProperty,
      sortDirection,
      usePagination
    );
    var paginatedAbbreviations = lookupTablesPort.findNormAbbreviations(
      new NormAbbreviationQuery(searchTerm, queryOptions)
    );
    return ResponseEntity.ok(
      new NormAbbreviationResponse(
        paginatedAbbreviations.content(),
        new PageResponse(paginatedAbbreviations)
      )
    );
  }
}

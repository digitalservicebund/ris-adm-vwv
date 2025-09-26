package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for accessing the {@link ReferenceType} resource (lookup table).
 */
@RestController
@RequiredArgsConstructor
public class ReferenceTypeController {

  private final LookupTablesPort lookupTablesPort;

  /**
   * Return reference types (optionally with search term, pagination, sorting)
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
  @GetMapping("api/lookup-tables/reference-types")
  public ResponseEntity<ReferenceTypeResponse> getReferenceTypes(
    @RequestParam(required = false) String searchTerm,
    @RequestParam(defaultValue = "0") int pageNumber,
    @RequestParam(defaultValue = "3") int pageSize,
    @RequestParam(defaultValue = "name") String sortByProperty,
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
    var paginatedReferenceTypes = lookupTablesPort.findReferenceTypes(
      new ReferenceTypeQuery(searchTerm, queryOptions)
    );
    return ResponseEntity.ok(
      new ReferenceTypeResponse(
        paginatedReferenceTypes.content(),
        new PageResponse(paginatedReferenceTypes)
      )
    );
  }
}

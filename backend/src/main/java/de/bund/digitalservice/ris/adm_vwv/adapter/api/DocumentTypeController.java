package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeQuery;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import de.bund.digitalservice.ris.adm_vwv.application.PaginationDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for accessing the {@link DocumentType} resource (lookup table).
 */
@RestController
@RequiredArgsConstructor
public class DocumentTypeController {

  private final LookupTablesPort lookupTablesPort;

  /**
   * Return document types (optionally with search term, pagination, sorting)
   *
   * @param searchTerm Keyword to restrict results to.
   * @param paginationPageNumber Which page of pagination to return?
   * @param paginationPageSize How many elements per page in pagination?
   * @param sortByProperty Sort by what property?
   * @param sortDirection Sort ascending or descending?
   * @param usePagination Search with pagination?
   *
   * @return Response object with list of DocumentTypes and pagination information
   */
  @GetMapping("api/lookup-tables/document-types")
  public ResponseEntity<DocumentTypeResponse> getDocumentTypes(
    @RequestParam(required = false) String searchTerm,
    @RequestParam(defaultValue = "0") int paginationPageNumber,
    @RequestParam(defaultValue = "4") int paginationPageSize,
    @RequestParam(defaultValue = "name") String sortByProperty,
    @RequestParam(defaultValue = "ASC") Sort.Direction sortDirection,
    @RequestParam(defaultValue = "true") boolean usePagination
  ) {
    PaginationDetails paginationDetails = new PaginationDetails(
      paginationPageNumber,
      paginationPageSize,
      sortByProperty,
      sortDirection,
      usePagination
    );
    Page<DocumentType> resultPage = lookupTablesPort.findBySearchTerm(
      new DocumentTypeQuery(searchTerm, paginationDetails)
    );
    return ResponseEntity.ok(new DocumentTypeResponse(resultPage.getContent(), resultPage));
  }
}

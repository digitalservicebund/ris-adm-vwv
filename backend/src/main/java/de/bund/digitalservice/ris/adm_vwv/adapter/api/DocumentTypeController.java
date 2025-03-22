package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeQuery;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import de.bund.digitalservice.ris.adm_vwv.application.PageQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DocumentTypeController {

  private final LookupTablesPort lookupTablesPort;

  @GetMapping("api/lookup-tables/document-types")
  public ResponseEntity<DocumentTypeResponse> getDocumentTypes(
    @RequestParam(required = false) String searchQuery,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "4") int size,
    @RequestParam(defaultValue = "name") String sortBy,
    @RequestParam(defaultValue = "ASC") Sort.Direction sortDirection,
    @RequestParam(defaultValue = "true") boolean paged
  ) {
    PageQuery pageQuery = new PageQuery(page, size, sortBy, sortDirection, paged);
    Page<DocumentType> resultPage = lookupTablesPort.findDocumentTypes(
      new DocumentTypeQuery(searchQuery, pageQuery)
    );
    return ResponseEntity.ok(new DocumentTypeResponse(resultPage.getContent(), resultPage));
  }
}

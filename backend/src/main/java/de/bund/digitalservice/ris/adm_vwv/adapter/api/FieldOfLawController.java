package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLawQuery;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import de.bund.digitalservice.ris.adm_vwv.application.PageQuery;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class FieldOfLawController {

  private final LookupTablesPort lookupTablesPort;

  @GetMapping("api/lookup-tables/fields-of-law/root/children")
  public ResponseEntity<FieldOfLawResponse> getFieldsOfLawParents() {
    return ResponseEntity.ok(new FieldOfLawResponse(lookupTablesPort.findFieldsOfLawParents()));
  }

  @GetMapping("api/lookup-tables/fields-of-law/{identifier}/children")
  public ResponseEntity<FieldOfLawResponse> getFieldsOfLawChildren(
    @PathVariable String identifier
  ) {
    return ResponseEntity.ok(
      new FieldOfLawResponse(lookupTablesPort.findFieldsOfLawChildren(identifier))
    );
  }

  @GetMapping("api/lookup-tables/fields-of-law/{identifier}")
  public ResponseEntity<FieldOfLaw> getTreeForFieldOfLaw(@PathVariable String identifier) {
    return lookupTablesPort
      .findFieldOfLaw(identifier)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  @GetMapping("api/lookup-tables/fields-of-law")
  public Page<FieldOfLaw> findFieldsOfLaw(
    @RequestParam(value = "identifier", required = false) String identifier,
    @RequestParam(value = "text", required = false) String text,
    @RequestParam(value = "norm", required = false) String norm,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "30") int size,
    @RequestParam(defaultValue = "identifier") String sortBy,
    @RequestParam(defaultValue = "ASC") Sort.Direction sortDirection,
    @RequestParam(defaultValue = "true") boolean paged
  ) {
    PageQuery pageQuery = new PageQuery(page, size, sortBy, sortDirection, paged);

    return lookupTablesPort.findFieldsOfLaw(
      new FieldOfLawQuery(
        StringUtils.trimToNull(identifier),
        StringUtils.trimToNull(text),
        StringUtils.trimToNull(norm),
        pageQuery
      )
    );
  }
}

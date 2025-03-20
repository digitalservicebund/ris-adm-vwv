package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  public ResponseEntity<FieldOfLawResponse> getFieldsOfLawChildren(@PathVariable String identifier) {
    return ResponseEntity.ok(
      new FieldOfLawResponse(lookupTablesPort.findFieldsOfLawChildren(identifier))
    );
  }
}

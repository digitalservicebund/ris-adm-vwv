package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import com.fasterxml.jackson.databind.JsonNode;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnit;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitListElement;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitPort;
import de.bund.digitalservice.ris.adm_vwv.application.Fundstelle;
import de.bund.digitalservice.ris.adm_vwv.application.Periodikum;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for CRUD on documentation units.
 */
@RestController
@RequiredArgsConstructor
public class DocumentationUnitController {

  private final DocumentationUnitPort documentationUnitPort;

  /**
   * Returns information on all documentation units
   *
   * @return paginated list of document units
   */
  @GetMapping("api/documentation-units")
  public ResponseEntity<DocumentUnitListResponse> getAll() {
    List<DocumentationUnitListElement> list = List.of(
      new DocumentationUnitListElement(
        UUID.fromString("11111111-1657-4085-ae2a-993a04c27f6b"),
        "sample dokumentnummer 1",
        "2011-11-11",
        "Sample Document Title 1",
        List.of(
          new Fundstelle(
            "fundstellen id 1",
            "zitatstelle 1",
            List.of(
              new Periodikum(
                "periodikum id 1",
                "periodikum title 1",
                "periodikum subtitle 1",
                "p.abbrev.1"
              ),
              new Periodikum(
                "periodikum id 2",
                "periodikum title 2",
                "periodikum subtitle 2",
                "p.abbrev.2"
              )
            )
          ),
          new Fundstelle("fundstellen id 2", "zitatstelle 2", List.of())
        )
      ),
      new DocumentationUnitListElement(
        UUID.fromString("22222222-1657-4085-ae2a-993a04c27f6b"),
        "sample dokumentnummer 2",
        "2011-11-11",
        "Sample Document Title 2",
        List.of()
      )
    );

    Page<DocumentationUnitListElement> pagedList = new PageImpl<>(list);
    DocumentUnitListResponse response = new DocumentUnitListResponse(pagedList);
    return ResponseEntity.ok(response);
  }

  /**
   * Returns a single documentation unit by its document number
   *
   * @param documentNumber The document number of the document unit to be returned
   *
   * @return The document unit or HTTP 404 if not found
   */
  @GetMapping("api/documentation-units/{documentNumber}")
  public ResponseEntity<DocumentationUnit> find(@PathVariable String documentNumber) {
    return documentationUnitPort
      .findByDocumentNumber(documentNumber)
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }

  /**
   * Creates a new documentation unit with a new document number in database and
   * returns it.
   *
   * @return Created documentation unit
   */
  @PostMapping("api/documentation-units")
  @ResponseStatus(HttpStatus.CREATED)
  public DocumentationUnit create() {
    return documentationUnitPort.create();
  }

  /**
   * Updates a documentation unit
   *
   * @param documentNumber    The document number of the document to update
   * @param documentationUnit The JSON of the documentation unit to update
   *
   * @return the updated documentation unit or HTTP 404 if not found
   */
  @PutMapping("api/documentation-units/{documentNumber}")
  public ResponseEntity<DocumentationUnit> update(
    @PathVariable String documentNumber,
    @RequestBody JsonNode documentationUnit
  ) {
    return documentationUnitPort
      .update(documentNumber, documentationUnit.toString())
      .map(ResponseEntity::ok)
      .orElse(ResponseEntity.notFound().build());
  }
}

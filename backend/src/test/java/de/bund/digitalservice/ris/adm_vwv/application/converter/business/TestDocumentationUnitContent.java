package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import java.util.List;

/**
 * Test class for easily creating instances of {@link DocumentationUnitContent}.
 */
public class TestDocumentationUnitContent {

  public static DocumentationUnitContent create(String documentNumber, String langueberschrift) {
    return new DocumentationUnitContent(
      null,
      documentNumber,
      List.of(),
      List.of(),
      langueberschrift,
      List.of(),
      List.of("2025-01-01"),
      null,
      null,
      null,
      null,
      List.of(),
      true,
      new DocumentType("VR", "Verwaltungsregelung"),
      null,
      List.of(),
      List.of(),
      List.of(),
      null,
      List.of(TestNormgeber.createByLegalEntity("Erste Jurpn")),
      List.of(),
      List.of(),
      List.of()
    );
  }

  public static DocumentationUnitContent createEmpty(
    String documentNumber,
    String langueberschrift
  ) {
    return new DocumentationUnitContent(
      null,
      documentNumber,
      List.of(),
      List.of(),
      langueberschrift,
      List.of(),
      List.of(),
      null,
      null,
      null,
      null,
      List.of(),
      true,
      null,
      null,
      List.of(),
      List.of(),
      List.of(),
      null,
      List.of(),
      List.of(),
      List.of(),
      List.of()
    );
  }
}

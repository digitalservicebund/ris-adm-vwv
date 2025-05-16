package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import static org.assertj.core.api.Assertions.assertThat;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.LegalPeriodical;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class DocumentationUnitContentTest {

  @Test
  void constructDocumentationUnit() {
    // given
    ActiveCitation activeCitation = new ActiveCitation(
      UUID.randomUUID(),
      false,
      "KORE000000012",
      new Court(UUID.randomUUID(), "sozial", "Kassel", "BSG"),
      "12.12.2021",
      "XXY",
      new DocumentType("VR", "Verwaltungsregelung"),
      new CitationType(UUID.randomUUID(), "Anw", "Anwendung")
    );

    // when
    DocumentationUnitContent documentationUnitContent = new DocumentationUnitContent(
      UUID.randomUUID(),
      "KSNR0000001",
      List.of(
        new Reference(
          UUID.randomUUID(),
          "citation",
          new LegalPeriodical("BAnz", "Bundesanzeiger", "subtitle", "2021"),
          "BAnz"
        )
      ),
      List.of(),
      "Überschrift",
      List.of("Schlagwort"),
      "12.12.2021",
      "01.01.2022",
      null,
      null,
      null,
      List.of("XX"),
      false,
      new DocumentType("VV", "Verwaltungsvorschrift"),
      "Regelung",
      List.of(activeCitation),
      List.of(
        new ActiveReference(
          "verwaltungsvorschrift",
          "Anwendung",
          new NormAbbreviation(UUID.randomUUID(), "BGB", "Bürgerliches Gesetzbuch"),
          "BGB",
          List.of(new SingleNorm(UUID.randomUUID(), "§ 1", null, null))
        )
      ),
      List.of(
        new NormReference(
          new NormAbbreviation(UUID.randomUUID(), "BGB", "Bürgerliches Gesetzbuch"),
          "BGB",
          List.of(new SingleNorm(UUID.randomUUID(), "§ 1", null, null))
        )
      ),
      "note",
      List.of()
    );

    // then
    assertThat(documentationUnitContent.activeCitations()).hasSize(1);
  }
}

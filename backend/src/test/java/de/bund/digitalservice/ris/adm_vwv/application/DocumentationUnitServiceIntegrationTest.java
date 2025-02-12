package de.bund.digitalservice.ris.adm_vwv.application;

import de.bund.digitalservice.ris.adm_vwv.TestcontainersConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
class DocumentationUnitServiceIntegrationTest {

  @Autowired
  private DocumentationUnitService documentationUnitService;

  @Test
  void create() {
    // given

    // when
    DocumentationUnit documentationUnit = documentationUnitService.create();

    // then
    assertThat(documentationUnit)
      .isNotNull()
      .extracting(DocumentationUnit::documentNumber)
      .satisfies(dun -> assertThat(dun).startsWith("KSNR"));
  }

  @Test
  void update() {
    // given
    DocumentationUnit documentationUnit = documentationUnitService.create();

    // when
    Optional<DocumentationUnit> updated =
      documentationUnitService.update(documentationUnit.documentNumber(), "{\"test\":\"content\"}");

    // then
    assertThat(updated)
      .isPresent()
      .hasValueSatisfying(dun -> assertThat(dun.json()).isEqualTo("{\"test\":\"content\"}"));
  }

  @Test
  void update_notFound() {
    // given
    String documentNumber = "KSNR000000001";

    // when
    Optional<DocumentationUnit> updated = documentationUnitService.update(documentNumber, "{}");

    // then
    assertThat(updated).isEmpty();
  }
}

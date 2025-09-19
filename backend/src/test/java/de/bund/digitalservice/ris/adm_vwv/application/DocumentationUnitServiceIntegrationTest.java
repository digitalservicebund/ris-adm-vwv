package de.bund.digitalservice.ris.adm_vwv.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.AssertionsForClassTypes.catchThrowable;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.PublishPort;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.TestDocumentationUnitContent;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class DocumentationUnitServiceIntegrationTest {

  @Autowired
  private DocumentationUnitService documentationUnitService;

  @MockitoBean
  private PublishPort publishPort;

  @Test
  void find() {
    // given
    DocumentationUnit documentationUnit = documentationUnitService.create();
    String documentNumber = documentationUnit.documentNumber();

    // when
    Optional<DocumentationUnit> actual = documentationUnitService.findByDocumentNumber(
      documentNumber
    );

    // then
    assertThat(actual)
      .isPresent()
      .hasValueSatisfying(actualDocumentationUnit ->
        assertThat(actualDocumentationUnit.id()).isEqualTo(documentationUnit.id())
      );
  }

  @Test
  void create() {
    // given

    // when
    DocumentationUnit documentationUnit = documentationUnitService.create();

    // then
    assertThat(documentationUnit)
      .isNotNull()
      .extracting(DocumentationUnit::documentNumber)
      .satisfies(documentNumber -> assertThat(documentNumber).startsWith("KSNR"));
  }

  @Test
  void update() {
    // given
    DocumentationUnit documentationUnit = documentationUnitService.create();

    // when
    Optional<DocumentationUnit> updated = documentationUnitService.update(
      documentationUnit.documentNumber(),
      "{\"test\":\"content\"}"
    );

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

  @Test
  void publish() {
    // given
    DocumentationUnit documentationUnit = documentationUnitService.create();

    // when
    Optional<DocumentationUnit> published = documentationUnitService.publish(
      documentationUnit.documentNumber(),
      TestDocumentationUnitContent.create(documentationUnit.documentNumber(), "Lang")
    );

    // then
    assertThat(published)
      .isPresent()
      .hasValueSatisfying(dun ->
        assertThat(dun.json()).contains(
          "\"documentNumber\":\"" + documentationUnit.documentNumber() + "\""
        )
      );
  }

  @Test
  void publish_notFound() {
    // given
    String documentNumber = "KSNR000000001a";

    // when
    Optional<DocumentationUnit> published = documentationUnitService.publish(
      documentNumber,
      TestDocumentationUnitContent.create(null, null)
    );

    // then
    assertThat(published).isEmpty();
  }

  @Test
  void publish_shouldRollbackTransaction_whenExternalPublishingFails() {
    // given
    DocumentationUnit documentationUnit = documentationUnitService.create();
    String documentNumber = documentationUnit.documentNumber();
    assertThat(documentationUnit.json()).isNull();

    // Publishing to bucket fails
    doThrow(new PublishingFailedException("External system is down", null))
      .when(publishPort)
      .publish(any(PublishPort.Options.class));

    // when: Attempt to publish, and it fails
    Throwable thrown = catchThrowable(() ->
      documentationUnitService.publish(
        documentNumber,
        TestDocumentationUnitContent.create(documentNumber, "Some Content")
      )
    );

    // then: The correct exception was thrown
    assertThat(thrown).isInstanceOf(PublishingFailedException.class);

    // The transaction was rolled back
    Optional<DocumentationUnit> actual = documentationUnitService.findByDocumentNumber(
      documentNumber
    );
    assertThat(actual).isPresent().hasValueSatisfying(dun -> assertThat(dun.json()).isNull());
  }
}

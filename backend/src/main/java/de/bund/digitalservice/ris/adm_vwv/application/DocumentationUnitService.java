package de.bund.digitalservice.ris.adm_vwv.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bund.digitalservice.ris.adm_vwv.adapter.persistence.DocumentationUnitPersistenceService;
import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.PublishPort;
import de.bund.digitalservice.ris.adm_vwv.application.converter.LdmlConverterService;
import de.bund.digitalservice.ris.adm_vwv.application.converter.LdmlPublishConverterService;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
import de.bund.digitalservice.ris.adm_vwv.config.security.UserDocumentDetails;
import jakarta.annotation.Nonnull;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Application service for CRUD operations on document units.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentationUnitService {

  private final DocumentationUnitPersistenceService documentationUnitPersistenceService;
  private final LdmlConverterService ldmlConverterService;
  private final LdmlPublishConverterService ldmlPublishConverterService;
  private final ObjectMapper objectMapper;
  private final PublishPort publishPort;

  /**
   * Finds a DocumentationUnit by its document number.
   * If the found unit exists with XML but no JSON, it is converted before being returned.
   *
   * @param documentNumber The document number to search for.
   * @return An {@link Optional} containing the DocumentationUnit, or an empty Optional if not found.
   */
  public Optional<DocumentationUnit> findByDocumentNumber(@Nonnull String documentNumber) {
    var optionalDocumentationUnit = documentationUnitPersistenceService.findByDocumentNumber(
      documentNumber
    );
    if (
      optionalDocumentationUnit.isPresent() &&
      optionalDocumentationUnit.map(DocumentationUnit::json).isEmpty() &&
      optionalDocumentationUnit.map(DocumentationUnit::xml).isPresent()
    ) {
      // For an existing documentation unit without JSON but existing xml needs to be converted
      return convertLdml(optionalDocumentationUnit.get());
    }
    return optionalDocumentationUnit;
  }

  private Optional<DocumentationUnit> convertLdml(DocumentationUnit documentationUnit) {
    var documentationUnitContent = ldmlConverterService.convertToBusinessModel(documentationUnit);
    String json = convertToJson(documentationUnitContent);
    return Optional.of(new DocumentationUnit(documentationUnit, json));
  }

  private String convertToJson(DocumentationUnitContent documentationUnitContent) {
    try {
      return objectMapper.writeValueAsString(documentationUnitContent);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException(e);
    }
  }

  public DocumentationUnit create() {
    return documentationUnitPersistenceService.create();
  }

  public Optional<DocumentationUnit> update(@Nonnull String documentNumber, @Nonnull String json) {
    return Optional.ofNullable(documentationUnitPersistenceService.update(documentNumber, json));
  }

  /**
   * Updates and publishes a DocumentationUnit with new content.
   * <p>
   * The update is persisted to the database and then published to an external bucket.
   * The {@link UserDocumentDetails} decide to which bucket to publish (to be implemented):
   * {@code UserDocumentDetails details = (UserDocumentDetails) authentication.getPrincipal()}
   * This entire operation is transactional and will be rolled back if any step fails.
   *
   * @param documentNumber The identifier of the documentation unit to publish.
   * @param documentationUnitContent The new content for the unit.
   * @return An {@link Optional} with the updated unit, or empty if the document number was not found.
   */
  @Transactional
  public Optional<DocumentationUnit> publish(
    @Nonnull String documentNumber,
    @Nonnull DocumentationUnitContent documentationUnitContent
  ) {
    var optionalDocumentationUnit = documentationUnitPersistenceService.findByDocumentNumber(
      documentNumber
    );

    if (optionalDocumentationUnit.isEmpty()) {
      return Optional.empty();
    }

    DocumentationUnit documentationUnit = optionalDocumentationUnit.get();
    String xml = ldmlPublishConverterService.convertToLdml(
      documentationUnitContent,
      documentationUnit.xml()
    );
    String json = convertToJson(documentationUnitContent);
    DocumentationUnit publishedDocumentationUnit = documentationUnitPersistenceService.publish(
      documentNumber,
      json,
      xml
    );

    // publish to portal
    // later when we want to publish to other publishers, we can receive them form the method param and select them here
    // If the publishing or validation fails, the transaction is rolled back
    final String BSG_PUBLISHER_NAME = "privateBsgPublisher";
    var publishOptions = new PublishPort.PublicationDetails(
      documentNumber,
      xml,
      BSG_PUBLISHER_NAME
    );
    publishPort.publish(publishOptions);
    return convertLdml(publishedDocumentationUnit);
  }

  public Page<DocumentationUnitOverviewElement> findDocumentationUnitOverviewElements(
    @Nonnull DocumentationUnitQuery queryOptions
  ) {
    return documentationUnitPersistenceService.findDocumentationUnitOverviewElements(queryOptions);
  }
}

package de.bund.digitalservice.ris.adm_vwv.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.PublishPort;
import de.bund.digitalservice.ris.adm_vwv.application.converter.LdmlConverterService;
import de.bund.digitalservice.ris.adm_vwv.application.converter.LdmlPublishConverterService;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
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
public class DocumentationUnitService implements DocumentationUnitPort {

  private final DocumentationUnitPersistencePort documentationUnitPersistencePort;
  private final LdmlConverterService ldmlConverterService;
  private final LdmlPublishConverterService ldmlPublishConverterService;
  private final ObjectMapper objectMapper;
  private final PublishPort publishPort;

  @Override
  public Optional<DocumentationUnit> findByDocumentNumber(@Nonnull String documentNumber) {
    var optionalDocumentationUnit = documentationUnitPersistencePort.findByDocumentNumber(
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

  @Override
  public DocumentationUnit create() {
    return documentationUnitPersistencePort.create();
  }

  @Override
  public Optional<DocumentationUnit> update(@Nonnull String documentNumber, @Nonnull String json) {
    return Optional.ofNullable(documentationUnitPersistencePort.update(documentNumber, json));
  }

  @Transactional
  @Override
  public Optional<DocumentationUnit> publish(
    @Nonnull String documentNumber,
    @Nonnull DocumentationUnitContent documentationUnitContent
  ) {
    var optionalDocumentationUnit = documentationUnitPersistencePort.findByDocumentNumber(
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
    DocumentationUnit publishedDocumentationUnit = documentationUnitPersistencePort.publish(
      documentNumber,
      json,
      xml
    );

    // publish to portal
    // later when we want to publish to other publishers, we can receive them form the method param and select them here
    // If the publishing or validation fails, the transaction is rolled back
    final String BSG_PUBLISHER_NAME = "privateBsgPublisher";
    var publishOptions = new PublishPort.Options(documentNumber, xml, BSG_PUBLISHER_NAME);
    publishPort.publish(publishOptions);
    return convertLdml(publishedDocumentationUnit);
  }

  @Override
  public Page<DocumentationUnitOverviewElement> findDocumentationUnitOverviewElements(
    @Nonnull DocumentationUnitQuery queryOptions
  ) {
    return documentationUnitPersistencePort.findDocumentationUnitOverviewElements(queryOptions);
  }
}

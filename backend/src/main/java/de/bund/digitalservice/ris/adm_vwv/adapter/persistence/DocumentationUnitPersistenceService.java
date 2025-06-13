package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.LdmlConverterService;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
import jakarta.annotation.Nonnull;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persistence service for CRUD operations on documentation units
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentationUnitPersistenceService implements DocumentationUnitPersistencePort {

  static final String ENTRY_SEPARATOR = "$µµµµµ$";

  private static final int INDEX_BATCH_SIZE = 500;

  private final DocumentationUnitCreationService documentationUnitCreationService;
  private final DocumentationUnitRepository documentationUnitRepository;
  private final DocumentationUnitIndexRepository documentationUnitIndexRepository;
  private final ObjectMapper objectMapper;
  private final LdmlConverterService ldmlConverterService;

  @Override
  @Transactional(readOnly = true)
  public Optional<DocumentationUnit> findByDocumentNumber(@Nonnull String documentNumber) {
    return documentationUnitRepository
      .findByDocumentNumber(documentNumber)
      .map(documentationUnitEntity ->
        new DocumentationUnit(
          documentNumber,
          documentationUnitEntity.getId(),
          documentationUnitEntity.getJson(),
          documentationUnitEntity.getXml()
        )
      );
  }

  @Override
  public DocumentationUnit create() {
    // Issue for the very first documentation unit of a new year: If for this year
    // there is no
    // document number stored, then concurrent threads can lead to an
    // DataIntegrityViolationException due to
    // unique constraint violation (try to persist same document number twice).
    // In that case the creation process is retried. Note, that even though the
    // exception is handled, there will
    // be a warn and an error message logged by Hibernate, which cannot be avoided.
    // The used retry template can only handle a database exception if the
    // underlying transaction completes
    // with a commit; therefore a secondary bean (DocumentationUnitCreationService)
    // is used to encapsulate
    // the transaction. This method must not have a @Transactional annotation.
    RetryTemplate retryTemplate = RetryTemplate.builder()
      .retryOn(DataIntegrityViolationException.class)
      .build();
    DocumentationUnit documentationUnit = retryTemplate.execute(_ ->
      documentationUnitCreationService.create()
    );
    log.info(
      "New documentation unit created with document number: {}",
      documentationUnit.documentNumber()
    );
    return documentationUnit;
  }

  @Override
  @Transactional
  public DocumentationUnit update(@Nonnull String documentNumber, @Nonnull String json) {
    return documentationUnitRepository
      .findByDocumentNumber(documentNumber)
      .map(documentationUnitEntity -> {
        documentationUnitEntity.setJson(json);
        log.info("Updated documentation unit with document number: {}.", documentNumber);
        index(documentationUnitEntity);
        log.info("Re-indexed documentation unit with document number: {}.", documentNumber);
        return new DocumentationUnit(documentNumber, documentationUnitEntity.getId(), json);
      })
      .orElse(null);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<DocumentationUnitOverviewElement> findDocumentationUnitOverviewElements(
    @Nonnull DocumentationUnitQuery query
  ) {
    QueryOptions queryOptions = query.queryOptions();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);

    DocumentUnitSpecification documentUnitSpecification = new DocumentUnitSpecification(
      query.documentNumber(),
      query.langueberschrift(),
      query.fundstellen(),
      query.zitierdaten()
    );
    var documentationUnitsPage = documentationUnitRepository.findAll(
      documentUnitSpecification,
      pageable
    );
    return PageTransformer.transform(documentationUnitsPage, documentationUnit -> {
      DocumentationUnitIndexEntity index = documentationUnit.getDocumentationUnitIndex();

      if (index == null) {
        return new DocumentationUnitOverviewElement(
          documentationUnit.getId(),
          documentationUnit.getDocumentNumber(),
          Collections.emptyList(),
          null,
          Collections.emptyList()
        );
      }

      return new DocumentationUnitOverviewElement(
        documentationUnit.getId(),
        documentationUnit.getDocumentNumber(),
        splitBySeparator(index.getZitierdaten()),
        index.getLangueberschrift(),
        splitBySeparator(index.getFundstellen())
      );
    });
  }

  private List<String> splitBySeparator(String value) {
    String[] separatedValues = StringUtils.splitByWholeSeparator(value, ENTRY_SEPARATOR);
    return separatedValues != null ? List.of(separatedValues) : List.of();
  }

  /**
   * Execute indexing of all documentation units without documentation unit index.
   *
   * @return Number of indexed documents
   */
  @Transactional
  public long indexAll() {
    PageRequest pageable = PageRequest.of(0, INDEX_BATCH_SIZE);
    long totalNumberOfElements = 0;
    Slice<DocumentationUnitEntity> documentationUnitEntities;
    do {
      documentationUnitEntities = documentationUnitRepository.findByDocumentationUnitIndexIsNull(
        pageable
      );
      log.info(
        "Found {} documentation units for indexing, page {}.",
        documentationUnitEntities.getSize(),
        documentationUnitEntities.getNumber()
      );
      documentationUnitEntities.stream().forEach(this::indexSafely);
      totalNumberOfElements += documentationUnitEntities.getNumberOfElements();
    } while (documentationUnitEntities.hasNext());
    return totalNumberOfElements;
  }

  private void indexSafely(DocumentationUnitEntity documentationUnitEntity) {
    try {
      index(documentationUnitEntity);
    } catch (Exception e) {
      log.warn(
        "Could not index documentation unit {}. Reason: {}.",
        documentationUnitEntity.getDocumentNumber(),
        e.getMessage()
      );
      log.debug("Stacktrace:", e);
      // We save an empty entry so the document still appears on overview page
      saveDocumentationUnitIndex(documentationUnitEntity);
    }
  }

  private void index(@Nonnull DocumentationUnitEntity documentationUnitEntity) {
    if (documentationUnitEntity.isEmpty()) {
      // We save an empty entry so the document still appears on overview page
      saveDocumentationUnitIndex(documentationUnitEntity);
      return;
    }
    var documentationUnitIndexEntity = documentationUnitIndexRepository
      .findByDocumentationUnitId(documentationUnitEntity.getId())
      .orElseGet(() -> {
        var documentationUnitIndexEntityNew = new DocumentationUnitIndexEntity();
        documentationUnitIndexEntityNew.setDocumentationUnit(documentationUnitEntity);
        return documentationUnitIndexEntityNew;
      });
    if (documentationUnitEntity.getJson() == null && documentationUnitEntity.getXml() != null) {
      // Published documentation unit, there is only xml
      var documentationUnitContent = ldmlConverterService.convertToBusinessModel(
        new DocumentationUnit(
          documentationUnitEntity.getDocumentNumber(),
          documentationUnitEntity.getId(),
          null,
          documentationUnitEntity.getXml()
        )
      );
      updateDocumentationUnitIndexEntity(documentationUnitIndexEntity, documentationUnitContent);
    } else if (documentationUnitEntity.getJson() != null) {
      // Draft documentation unit, there is json
      DocumentationUnitContent documentationUnitContent = transformJson(
        documentationUnitEntity.getJson()
      );
      updateDocumentationUnitIndexEntity(documentationUnitIndexEntity, documentationUnitContent);
    }
    documentationUnitIndexRepository.save(documentationUnitIndexEntity);
  }

  private DocumentationUnitContent transformJson(@Nonnull String json) {
    try {
      return objectMapper.readValue(json, DocumentationUnitContent.class);
    } catch (JsonProcessingException e) {
      throw new IllegalStateException("Exception during transforming json: " + json, e);
    }
  }

  private void saveDocumentationUnitIndex(DocumentationUnitEntity documentationUnitEntity) {
    var documentationUnitIndexEntity = documentationUnitIndexRepository
      .findByDocumentationUnitId(documentationUnitEntity.getId())
      .orElseGet(() -> {
        var documentationUnitIndexEntityNew = new DocumentationUnitIndexEntity();
        documentationUnitIndexEntityNew.setDocumentationUnit(documentationUnitEntity);
        return documentationUnitIndexEntityNew;
      });
    documentationUnitIndexRepository.save(documentationUnitIndexEntity);
  }

  private void updateDocumentationUnitIndexEntity(
    DocumentationUnitIndexEntity documentationUnitIndexEntity,
    DocumentationUnitContent documentationUnitContent
  ) {
    documentationUnitIndexEntity.setLangueberschrift(documentationUnitContent.langueberschrift());
    if (documentationUnitContent.references() != null) {
      documentationUnitIndexEntity.setFundstellen(
        documentationUnitContent
          .references()
          .stream()
          .map(r -> r.legalPeriodicalRawValue() + " " + r.citation())
          .collect(Collectors.joining(ENTRY_SEPARATOR))
      );
    }
    if (documentationUnitContent.zitierdaten() != null) {
      documentationUnitIndexEntity.setZitierdaten(
        String.join(ENTRY_SEPARATOR, documentationUnitContent.zitierdaten())
      );
    }
  }
}

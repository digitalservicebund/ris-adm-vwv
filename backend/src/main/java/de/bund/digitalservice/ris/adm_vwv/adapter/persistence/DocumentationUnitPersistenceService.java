package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnit;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitPersistencePort;
import jakarta.annotation.Nonnull;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentationUnitPersistenceService implements DocumentationUnitPersistencePort {

  private final DocumentationUnitCreationService documentationUnitCreationService;
  private final DocumentationUnitRepository documentationUnitRepository;

  @Override
  @Transactional(readOnly = true)
  public Optional<DocumentationUnit> findByDocumentNumber(@Nonnull String documentNumber) {
    return documentationUnitRepository
      .findByDocumentNumber(documentNumber)
      .map(documentationUnitEntity ->
        new DocumentationUnit(
          documentNumber,
          documentationUnitEntity.getId(),
          documentationUnitEntity.getJson()
        )
      );
  }

  @Override
  public DocumentationUnit create() {
    // Issue for the very first documentation unit of a new year: If for this year there is no
    // document number stored, then concurrent threads can lead to an DataIntegrityViolationException due to
    // unique constraint violation (try to persist same document number twice).
    // In that case the creation process is retried. Note, that even though the exception is handled, there will
    // be a warn and an error message logged by Hibernate, which cannot be avoided.
    // The used retry template can only handle a database exception if the underlying transaction completes
    // with a commit; therefore a secondary bean (DocumentationUnitCreationService) is used to encapsulate
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
        return new DocumentationUnit(documentNumber, documentationUnitEntity.getId(), json);
      })
      .orElse(null);
  }
}

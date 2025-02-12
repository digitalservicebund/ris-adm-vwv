package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnit;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitPersistencePort;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentationUnitPersistenceService implements DocumentationUnitPersistencePort {

  private final DocumentationUnitRepository documentationUnitRepository;

  @Override
  @Transactional
  public DocumentationUnit create() {
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber(
      "KSNR" +
      LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
      new SecureRandom().nextInt(1000)
    );
    DocumentationUnitEntity saved = documentationUnitRepository.save(documentationUnitEntity);
    return new DocumentationUnit(saved.getDocumentNumber(), saved.getId());
  }
}

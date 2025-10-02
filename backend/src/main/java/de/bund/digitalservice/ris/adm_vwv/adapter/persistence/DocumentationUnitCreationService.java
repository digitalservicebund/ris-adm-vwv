package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeCode;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationOffice;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnit;
import java.text.DecimalFormat;
import java.time.Year;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
class DocumentationUnitCreationService {

  private final DocumentationUnitRepository documentationUnitRepository;
  private final DocumentNumberRepository documentNumberRepository;
  private final InMemoryDocumentNumberStore inMemoryDocumentNumberStore;
  private static final DecimalFormat COUNTER_FORMAT = new DecimalFormat("000000");

  @Transactional
  // 1. Create or update the document number for this year and docOffice type
  public DocumentationUnit create(DocumentationOffice office, DocumentTypeCode type) {
    Year thisYear = Year.now();
    String prefix = office.prefix + type.prefix;
    if (type == DocumentTypeCode.ADMINISTRATIVE) {
      // 1. Create or update the document number for this year
      DocumentNumberEntity documentNumberEntity = documentNumberRepository
        .findByYear(thisYear)
        .orElseGet(() -> {
          DocumentNumberEntity newDocumentNumberEntity = new DocumentNumberEntity();
          newDocumentNumberEntity.setYear(thisYear);
          return newDocumentNumberEntity;
        });
      DocumentNumber documentNumber = new DocumentNumber(
        prefix,
        thisYear,
        documentNumberEntity.getLatest()
      );
      String newDocumentNumber = documentNumber.create();
      documentNumberEntity.setLatest(newDocumentNumber);
      documentNumberRepository.save(documentNumberEntity);
      // 2. Create the documentation unit with the created document number
      DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
      documentationUnitEntity.setDocumentNumber(newDocumentNumber);
      DocumentationUnitEntity saved = documentationUnitRepository.save(documentationUnitEntity);
      return new DocumentationUnit(saved.getDocumentNumber(), saved.getId(), null);
    } else { // TODO: This needs to be reworked once we have separate schemas --> RISDEV-9545 // NOSONAR
      // 1. Create a unique key for the document series (e.g., "KALUAB2025")
      String sequenceKey = prefix + thisYear.getValue();

      // 2. Get the next number from our in-memory store
      int nextCount = inMemoryDocumentNumberStore.getNextNumber(sequenceKey);

      // 3. Format the number with leading zeros and construct the full document number
      String newDocumentNumber = sequenceKey + COUNTER_FORMAT.format(nextCount);

      // 4. Create the documentation unit with the generated document number
      DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
      documentationUnitEntity.setDocumentNumber(newDocumentNumber);
      DocumentationUnitEntity saved = documentationUnitRepository.save(documentationUnitEntity);
      return new DocumentationUnit(saved.getDocumentNumber(), saved.getId(), null);
    }
  }
}

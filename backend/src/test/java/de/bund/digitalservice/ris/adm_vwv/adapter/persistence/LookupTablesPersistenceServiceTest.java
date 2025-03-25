package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeQuery;
import de.bund.digitalservice.ris.adm_vwv.application.PaginationDetails;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig
class LookupTablesPersistenceServiceTest {

  @InjectMocks
  private LookupTablesPersistenceService lookupTablesPersistenceService;

  @Mock
  private DocumentTypesRepository documentTypesRepository;

  @Test
  void findBySearchQuery_all() {
    // given
    DocumentTypeEntity documentTypeEntity = new DocumentTypeEntity();
    documentTypeEntity.setAbbreviation("VR");
    documentTypeEntity.setName("Verwaltungsregelung");
    given(documentTypesRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(documentTypeEntity))
    );

    // when
    Page<DocumentType> documentTypes = lookupTablesPersistenceService.findBySearchQuery(
      new DocumentTypeQuery(null, new PaginationDetails(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(documentTypes.getContent()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }

  @Test
  void findBySearchQuery_something() {
    // given
    DocumentTypeEntity documentTypeEntity = new DocumentTypeEntity();
    documentTypeEntity.setAbbreviation("VR");
    documentTypeEntity.setName("Verwaltungsregelung");
    given(
      documentTypesRepository.findByAbbreviationContainingIgnoreCaseOrNameContainingIgnoreCase(
        eq("something"),
        eq("something"),
        any(Pageable.class)
      )
    ).willReturn(new PageImpl<>(List.of(documentTypeEntity)));

    // when
    Page<DocumentType> documentTypes = lookupTablesPersistenceService.findBySearchQuery(
      new DocumentTypeQuery(
        "something",
        new PaginationDetails(0, 10, "name", Sort.Direction.ASC, true)
      )
    );

    // then
    assertThat(documentTypes.getContent()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }
}

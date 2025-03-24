package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
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

  @Mock
  private FieldOfLawRepository fieldOfLawRepository;

  @Test
  void findDocumentTypes_all() {
    // given
    DocumentTypeEntity documentTypeEntity = new DocumentTypeEntity();
    documentTypeEntity.setAbbreviation("VR");
    documentTypeEntity.setName("Verwaltungsregelung");
    given(documentTypesRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(documentTypeEntity))
    );

    // when
    Page<DocumentType> documentTypes = lookupTablesPersistenceService.findDocumentTypes(
      new DocumentTypeQuery(null, new PageQuery(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(documentTypes.getContent()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }

  @Test
  void findDocumentTypes_something() {
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
    Page<DocumentType> documentTypes = lookupTablesPersistenceService.findDocumentTypes(
      new DocumentTypeQuery("something", new PageQuery(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(documentTypes.getContent()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }

  @Test
  void findFieldsOfLawChildren() {
    // given
    FieldOfLawEntity childFieldOfLawEntity = createFieldOfLaw("AR-01", "Arbeitsrecht allgemein");
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw("AR", "Arbeitsrecht");
    parentFieldOfLawEntity.setChildren(Set.of(childFieldOfLawEntity));
    given(fieldOfLawRepository.findByIdentifier("AR")).willReturn(
      Optional.of(parentFieldOfLawEntity)
    );

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawChildren("AR");

    // then
    assertThat(fieldsOfLaw)
      .hasSize(1)
      .extracting(FieldOfLaw::text)
      .containsOnly("Arbeitsrecht allgemein");
  }

  @Test
  void findFieldsOfLawChildren_noChildren() {
    // given
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw("AR-01-05", "Arbeitsrecht speziell");
    given(fieldOfLawRepository.findByIdentifier("AR-01-05")).willReturn(
      Optional.of(parentFieldOfLawEntity)
    );

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawChildren(
      "AR-01-05"
    );

    // then
    assertThat(fieldsOfLaw).isEmpty();
  }

  @Test
  void findFieldsOfLawChildren_identifierNotFound() {
    // given
    given(fieldOfLawRepository.findByIdentifier("BR")).willReturn(Optional.empty());

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawChildren("BR");

    // then
    assertThat(fieldsOfLaw).isEmpty();
  }

  @Test
  void findFieldsOfLawParents() {
    // given
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw("AR", "Arbeitsrecht");
    given(fieldOfLawRepository.findByParentIsNullAndNotationOrderByIdentifier("NEW")).willReturn(
      List.of(parentFieldOfLawEntity)
    );

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawParents();

    // then
    assertThat(fieldsOfLaw).hasSize(1).extracting(FieldOfLaw::text).containsOnly("Arbeitsrecht");
  }

  @Test
  void findFieldOfLaw() {
    // given
    FieldOfLawEntity fieldOfLawEntity = createFieldOfLaw("AR", "Arbeitsrecht");
    given(fieldOfLawRepository.findByIdentifier("AR")).willReturn(Optional.of(fieldOfLawEntity));

    // when
    Optional<FieldOfLaw> actualFieldOfLaw = lookupTablesPersistenceService.findFieldOfLaw("AR");

    // then
    assertThat(actualFieldOfLaw)
      .isPresent()
      .hasValueSatisfying(fieldOfLaw -> assertThat(fieldOfLaw.text()).isEqualTo("Arbeitsrecht"));
  }

  @Test
  void findFieldOfLaw_notFound() {
    // given
    given(fieldOfLawRepository.findByIdentifier("BR")).willReturn(Optional.empty());

    // when
    Optional<FieldOfLaw> actualFieldOfLaw = lookupTablesPersistenceService.findFieldOfLaw("BR");

    // then
    assertThat(actualFieldOfLaw).isEmpty();
  }

  @Test
  void findFieldsOfLaw() {
    // given
    FieldOfLawQuery query = new FieldOfLawQuery(
      "AR-05",
      "arbeit",
      "AStG",
      new PageQuery(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(
      new PageImpl<>(
        List.of(
          createFieldOfLaw("AR-05", "Beendigung des Arbeitsverhältnisses"),
          createFieldOfLaw("BR-05", "Bericht")
        )
      )
    );

    // when
    Page<FieldOfLaw> result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.getContent())
      .hasSize(2)
      .extracting(FieldOfLaw::text)
      .containsOnly("Beendigung des Arbeitsverhältnisses", "Bericht");
  }

  @Test
  void findFieldsOfLaw_byNormOnly() {
    // given
    FieldOfLawQuery query = new FieldOfLawQuery(
      null,
      null,
      "AStG",
      new PageQuery(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(
      new PageImpl<>(List.of(createFieldOfLaw("AR-05", "Beendigung des Arbeitsverhältnisses")))
    );

    // when
    Page<FieldOfLaw> result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.getContent())
      .hasSize(1)
      .extracting(FieldOfLaw::text)
      .containsOnly("Beendigung des Arbeitsverhältnisses");
  }

  @Test
  void findFieldsOfLaw_noResults() {
    // given
    FieldOfLawQuery query = new FieldOfLawQuery(
      "AR-05-01-XX-YY-ZZ",
      "arbeitsbeschaffungsmaßnahmengegenentwurf",
      null,
      new PageQuery(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(new PageImpl<>(List.of()));

    // when
    Page<FieldOfLaw> result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.getContent()).isEmpty();
  }

  private FieldOfLawEntity createFieldOfLaw(String identifier, String text) {
    FieldOfLawEntity fieldOfLawEntity = new FieldOfLawEntity();
    fieldOfLawEntity.setId(UUID.randomUUID());
    fieldOfLawEntity.setIdentifier(identifier);
    fieldOfLawEntity.setText(text);
    FieldOfLawNormEntity normEntity = new FieldOfLawNormEntity();
    normEntity.setId(UUID.randomUUID());
    normEntity.setAbbreviation("AStG");
    normEntity.setSingleNormDescription("§ 17");
    fieldOfLawEntity.getNorms().add(normEntity);
    return fieldOfLawEntity;
  }
}

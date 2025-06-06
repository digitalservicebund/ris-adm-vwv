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
import org.springframework.data.domain.Example;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig
class LookupTablesPersistenceServiceTest {

  @InjectMocks
  private LookupTablesPersistenceService lookupTablesPersistenceService;

  @Mock
  private DocumentTypeRepository documentTypeRepository;

  @Mock
  private FieldOfLawRepository fieldOfLawRepository;

  @Mock
  private LegalPeriodicalsRepository legalPeriodicalsRepository;

  @Mock
  private InstitutionRepository institutionRepository;

  @Mock
  private RegionRepository regionRepository;

  @Test
  void findDocumentTypes_all() {
    // given
    DocumentTypeEntity documentTypeEntity = new DocumentTypeEntity();
    documentTypeEntity.setAbbreviation("VR");
    documentTypeEntity.setName("Verwaltungsregelung");
    given(documentTypeRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(documentTypeEntity))
    );

    // when
    var documentTypes = lookupTablesPersistenceService.findDocumentTypes(
      new DocumentTypeQuery(null, new QueryOptions(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(documentTypes.content()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }

  @Test
  void findDocumentTypes_something() {
    // given
    DocumentTypeEntity documentTypeEntity = new DocumentTypeEntity();
    documentTypeEntity.setAbbreviation("VR");
    documentTypeEntity.setName("Verwaltungsregelung");
    given(
      documentTypeRepository.findByAbbreviationContainingIgnoreCaseOrNameContainingIgnoreCase(
        eq("something"),
        eq("something"),
        any(Pageable.class)
      )
    ).willReturn(new PageImpl<>(List.of(documentTypeEntity)));

    // when
    var documentTypes = lookupTablesPersistenceService.findDocumentTypes(
      new DocumentTypeQuery("something", new QueryOptions(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(documentTypes.content()).contains(new DocumentType("VR", "Verwaltungsregelung"));
  }

  @Test
  void findFieldsOfLawChildren() {
    // given
    FieldOfLawEntity childFieldOfLawEntity = createFieldOfLaw("PR-01", "Phantasierecht allgemein");
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw("AR", "Phantasierecht");
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
      .containsOnly("Phantasierecht allgemein");
  }

  @Test
  void findFieldsOfLawChildren_noChildren() {
    // given
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw(
      "PR-01-05",
      "Phantasierecht speziell"
    );
    given(fieldOfLawRepository.findByIdentifier("PR-01-05")).willReturn(
      Optional.of(parentFieldOfLawEntity)
    );

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawChildren(
      "PR-01-05"
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
    FieldOfLawEntity parentFieldOfLawEntity = createFieldOfLaw("AR", "Phantasierecht");
    given(fieldOfLawRepository.findByParentIsNullAndNotationOrderByIdentifier("NEW")).willReturn(
      List.of(parentFieldOfLawEntity)
    );

    // when
    List<FieldOfLaw> fieldsOfLaw = lookupTablesPersistenceService.findFieldsOfLawParents();

    // then
    assertThat(fieldsOfLaw).hasSize(1).extracting(FieldOfLaw::text).containsOnly("Phantasierecht");
  }

  @Test
  void findFieldOfLaw() {
    // given
    FieldOfLawEntity fieldOfLawEntity = createFieldOfLaw("AR", "Phantasierecht");
    given(fieldOfLawRepository.findByIdentifier("AR")).willReturn(Optional.of(fieldOfLawEntity));

    // when
    Optional<FieldOfLaw> actualFieldOfLaw = lookupTablesPersistenceService.findFieldOfLaw("AR");

    // then
    assertThat(actualFieldOfLaw)
      .isPresent()
      .hasValueSatisfying(fieldOfLaw -> assertThat(fieldOfLaw.text()).isEqualTo("Phantasierecht"));
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
      "PR-05",
      "arbeit",
      "PStG",
      new QueryOptions(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(
      new PageImpl<>(
        List.of(
          createFieldOfLaw("PR-05", "Beendigung der Phantasieverhältnisse"),
          createFieldOfLaw("BR-05", "Bericht")
        )
      )
    );

    // when
    var result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.content())
      .hasSize(2)
      .extracting(FieldOfLaw::text)
      .containsOnly("Beendigung der Phantasieverhältnisse", "Bericht");
  }

  @Test
  void findFieldsOfLaw_byNormOnly() {
    // given
    FieldOfLawQuery query = new FieldOfLawQuery(
      null,
      null,
      "PStG",
      new QueryOptions(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(
      new PageImpl<>(List.of(createFieldOfLaw("PR-05", "Beendigung der Phantasieverhältnisse")))
    );

    // when
    var result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.content())
      .hasSize(1)
      .extracting(FieldOfLaw::text)
      .containsOnly("Beendigung der Phantasieverhältnisse");
  }

  @Test
  void findFieldsOfLaw_noResults() {
    // given
    FieldOfLawQuery query = new FieldOfLawQuery(
      "IDENTIFIER-UNKNOWN",
      "arbeitsbeschaffungsmaßnahmengegenentwurf",
      null,
      new QueryOptions(0, 10, "identifier", Sort.Direction.ASC, true)
    );
    given(
      fieldOfLawRepository.findAll(any(FieldOfLawSpecification.class), any(Pageable.class))
    ).willReturn(new PageImpl<>(List.of()));

    // when
    var result = lookupTablesPersistenceService.findFieldsOfLaw(query);

    // then
    assertThat(result.content()).isEmpty();
  }

  private FieldOfLawEntity createFieldOfLaw(String identifier, String text) {
    FieldOfLawEntity fieldOfLawEntity = new FieldOfLawEntity();
    fieldOfLawEntity.setId(UUID.randomUUID());
    fieldOfLawEntity.setIdentifier(identifier);
    fieldOfLawEntity.setText(text);
    fieldOfLawEntity.setNotation("NEW");
    FieldOfLawNormEntity normEntity = new FieldOfLawNormEntity();
    normEntity.setId(UUID.randomUUID());
    normEntity.setAbbreviation("PStG");
    normEntity.setSingleNormDescription("§ 99");
    fieldOfLawEntity.getNorms().add(normEntity);
    return fieldOfLawEntity;
  }

  @Test
  void findLegalPeriodicals_all() {
    // given
    var lpAbbreviation = "BKK";
    var lpTitle = "Die Betriebskrankenkasse";
    var lpSubtitle = "Zeitschrift des Bundesverbandes der Betriebskrankenkassen Essen";
    var lpCitationStyle = "1969, 138-140; BKK 2007, Sonderbeilage, 1-5";
    LegalPeriodicalEntity legalPeriodicalEntity = new LegalPeriodicalEntity();
    legalPeriodicalEntity.setAbbreviation(lpAbbreviation);
    legalPeriodicalEntity.setTitle(lpTitle);
    legalPeriodicalEntity.setSubtitle(lpSubtitle);
    legalPeriodicalEntity.setCitationStyle(lpCitationStyle);
    given(legalPeriodicalsRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(legalPeriodicalEntity))
    );

    // when
    var legalPeriodicals = lookupTablesPersistenceService.findLegalPeriodicals(
      new LegalPeriodicalQuery(
        null,
        new QueryOptions(0, 10, "abbreviation", Sort.Direction.ASC, true)
      )
    );

    // then
    assertThat(legalPeriodicals.content())
      .singleElement()
      .extracting(
        LegalPeriodical::abbreviation,
        LegalPeriodical::title,
        LegalPeriodical::subtitle,
        LegalPeriodical::citationStyle
      )
      .containsExactly(lpAbbreviation, lpTitle, lpSubtitle, lpCitationStyle);
  }

  @Test
  void findLegalPeriodicals_something() {
    // given
    var lpAbbreviation = "BKK";
    var lpTitle = "Die Betriebskrankenkasse";
    var lpSubtitle = "Zeitschrift des Bundesverbandes der Betriebskrankenkassen Essen";
    var lpCitationStyle = "1969, 138-140; BKK 2007, Sonderbeilage, 1-5";
    LegalPeriodicalEntity legalPeriodicalEntity = new LegalPeriodicalEntity();
    legalPeriodicalEntity.setAbbreviation(lpAbbreviation);
    legalPeriodicalEntity.setTitle(lpTitle);
    legalPeriodicalEntity.setSubtitle(lpSubtitle);
    legalPeriodicalEntity.setCitationStyle(lpCitationStyle);
    given(
      legalPeriodicalsRepository.findByAbbreviationContainingIgnoreCaseOrTitleContainingIgnoreCase(
        eq("something"),
        eq("something"),
        any(Pageable.class)
      )
    ).willReturn(new PageImpl<>(List.of(legalPeriodicalEntity)));

    // when
    var legalPeriodicals = lookupTablesPersistenceService.findLegalPeriodicals(
      new LegalPeriodicalQuery(
        "something",
        new QueryOptions(0, 10, "abbreviation", Sort.Direction.ASC, true)
      )
    );

    // then
    assertThat(legalPeriodicals.content())
      .singleElement()
      .extracting(
        LegalPeriodical::abbreviation,
        LegalPeriodical::title,
        LegalPeriodical::subtitle,
        LegalPeriodical::citationStyle
      )
      .containsExactly(lpAbbreviation, lpTitle, lpSubtitle, lpCitationStyle);
  }

  @Test
  void findLegalPeriodicalsByAbbreviation() {
    // given
    var lpAbbreviation = "BKK";
    var lpTitle = "Die Betriebskrankenkasse";
    var lpSubtitle = "Zeitschrift des Bundesverbandes der Betriebskrankenkassen Essen";
    var lpCitationStyle = "1969, 138-140; BKK 2007, Sonderbeilage, 1-5";
    LegalPeriodicalEntity legalPeriodicalEntity = new LegalPeriodicalEntity();
    legalPeriodicalEntity.setAbbreviation(lpAbbreviation);
    legalPeriodicalEntity.setTitle(lpTitle);
    legalPeriodicalEntity.setSubtitle(lpSubtitle);
    legalPeriodicalEntity.setCitationStyle(lpCitationStyle);
    LegalPeriodicalEntity probe = new LegalPeriodicalEntity();
    probe.setAbbreviation(lpAbbreviation);
    given(legalPeriodicalsRepository.findAll(Example.of(probe))).willReturn(
      List.of(legalPeriodicalEntity)
    );

    // when
    List<LegalPeriodical> legalPeriodicals =
      lookupTablesPersistenceService.findLegalPeriodicalsByAbbreviation("BKK");

    // then
    assertThat(legalPeriodicals)
      .singleElement()
      .extracting(
        LegalPeriodical::abbreviation,
        LegalPeriodical::title,
        LegalPeriodical::subtitle,
        LegalPeriodical::citationStyle
      )
      .containsExactly(lpAbbreviation, lpTitle, lpSubtitle, lpCitationStyle);
  }

  @Test
  void findInstitutions_all() {
    // given
    UUID uuid = UUID.randomUUID();
    InstitutionEntity institutionEntity = new InstitutionEntity();
    institutionEntity.setName("Jurpn");
    institutionEntity.setType("jurpn");
    institutionEntity.setId(uuid);
    RegionEntity regionEntity = new RegionEntity();
    regionEntity.setCode("AA");
    regionEntity.setId(uuid);
    institutionEntity.setRegions(Set.of(regionEntity));
    given(institutionRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(institutionEntity))
    );

    // when
    var institutions = lookupTablesPersistenceService.findInstitutions(
      new InstitutionQuery(null, new QueryOptions(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(institutions.content()).contains(
      new Institution(
        uuid,
        "Jurpn",
        null,
        InstitutionType.LEGAL_ENTITY,
        List.of(new Region(uuid, "AA", null))
      )
    );
  }

  @Test
  void findInstitutions_something() {
    // given
    UUID uuid = UUID.randomUUID();
    InstitutionEntity institutionEntity = new InstitutionEntity();
    institutionEntity.setName("Organ");
    institutionEntity.setType("organ");
    institutionEntity.setId(uuid);
    given(
      institutionRepository.findByNameContainingIgnoreCase(eq("something"), any(Pageable.class))
    ).willReturn(new PageImpl<>(List.of(institutionEntity)));

    // when
    var institutions = lookupTablesPersistenceService.findInstitutions(
      new InstitutionQuery("something", new QueryOptions(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(institutions.content()).contains(
      new Institution(uuid, "Organ", null, InstitutionType.INSTITUTION, List.of())
    );
  }

  @Test
  void findRegions_all() {
    // given
    UUID uuid = UUID.randomUUID();
    RegionEntity regionEntity = new RegionEntity();
    regionEntity.setCode("AA");
    regionEntity.setId(uuid);
    given(regionRepository.findAll(any(Pageable.class))).willReturn(
      new PageImpl<>(List.of(regionEntity))
    );

    // when
    var regions = lookupTablesPersistenceService.findRegions(
      new RegionQuery(null, new QueryOptions(0, 10, "code", Sort.Direction.ASC, true))
    );

    // then
    assertThat(regions.content()).contains(new Region(uuid, "AA", null));
  }

  @Test
  void findRegions_something() {
    // given
    UUID uuid = UUID.randomUUID();
    RegionEntity regionEntity = new RegionEntity();
    regionEntity.setCode("AA");
    regionEntity.setId(uuid);
    given(
      regionRepository.findByCodeContainingIgnoreCase(eq("something"), any(Pageable.class))
    ).willReturn(new PageImpl<>(List.of(regionEntity)));

    // when
    var regions = lookupTablesPersistenceService.findRegions(
      new RegionQuery("something", new QueryOptions(0, 10, "name", Sort.Direction.ASC, true))
    );

    // then
    assertThat(regions.content()).contains(new Region(uuid, "AA", null));
  }
}

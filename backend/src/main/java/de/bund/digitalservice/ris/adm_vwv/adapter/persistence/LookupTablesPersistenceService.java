package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static de.bund.digitalservice.ris.adm_vwv.adapter.persistence.InstitutionTypeMapper.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.application.Page;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Court;
import jakarta.annotation.Nonnull;
import java.util.*;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RegExUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Strings;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Persistence service for lookup tables.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LookupTablesPersistenceService implements LookupTablesPersistencePort {

  private final DocumentTypeRepository documentTypeRepository;
  private final FieldOfLawRepository fieldOfLawRepository;
  private final LegalPeriodicalsRepository legalPeriodicalsRepository;
  private final RegionRepository regionRepository;
  private final InstitutionRepository institutionRepository;

  @Override
  @Transactional(readOnly = true)
  public Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query) {
    QueryOptions queryOptions = query.queryOptions();
    String searchTerm = query.searchTerm();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);
    var documentTypes = StringUtils.isBlank(searchTerm)
      ? documentTypeRepository.findAll(pageable)
      : documentTypeRepository.findByAbbreviationContainingIgnoreCaseOrNameContainingIgnoreCase(
        searchTerm,
        searchTerm,
        pageable
      );
    return PageTransformer.transform(documentTypes, mapDocumentTypeEntity());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<DocumentType> findDocumentTypeByAbbreviation(@Nonnull String abbreviation) {
    return documentTypeRepository.findByAbbreviation(abbreviation).map(mapDocumentTypeEntity());
  }

  private Function<DocumentTypeEntity, DocumentType> mapDocumentTypeEntity() {
    return documentTypeEntity ->
      new DocumentType(documentTypeEntity.getAbbreviation(), documentTypeEntity.getName());
  }

  @Override
  @Transactional(readOnly = true)
  public List<FieldOfLaw> findFieldsOfLawChildren(@Nonnull String identifier) {
    return fieldOfLawRepository
      .findByIdentifier(identifier)
      .map(fieldOfLawEntity -> FieldOfLawTransformer.transformToDomain(fieldOfLawEntity, true, true)
      )
      .map(FieldOfLaw::children)
      .orElse(List.of());
  }

  @Override
  @Transactional(readOnly = true)
  public List<FieldOfLaw> findFieldsOfLawParents() {
    return fieldOfLawRepository
      .findByParentIsNullAndNotationOrderByIdentifier("NEW")
      .stream()
      .map(fieldOfLawEntity ->
        FieldOfLawTransformer.transformToDomain(fieldOfLawEntity, false, true)
      )
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<FieldOfLaw> findFieldOfLaw(@Nonnull String identifier) {
    return fieldOfLawRepository
      .findByIdentifier(identifier)
      .map(fieldOfLawEntity -> FieldOfLawTransformer.transformToDomain(fieldOfLawEntity, true, true)
      );
  }

  @Override
  @Transactional(readOnly = true)
  public Page<FieldOfLaw> findFieldsOfLaw(@Nonnull FieldOfLawQuery query) {
    QueryOptions queryOptions = query.queryOptions();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);

    List<String> textTerms = splitSearchTerms(query.text());
    List<String> normTerms = splitSearchTerms(
      StringUtils.trimToNull(Strings.CS.replace(query.norm(), "§", ""))
    );
    FieldOfLawSpecification fieldOfLawSpecification = new FieldOfLawSpecification(
      query.identifier(),
      textTerms,
      normTerms
    );
    var searchResult = fieldOfLawRepository
      .findAll(fieldOfLawSpecification, pageable)
      .map(fieldOfLawEntity ->
        FieldOfLawTransformer.transformToDomain(fieldOfLawEntity, false, true)
      );

    if (searchResult.isEmpty()) {
      // If no results found, do not re-sort result
      return PageTransformer.transform(searchResult);
    }

    String normParagraphsWithSpace = RegExUtils.replaceAll(
      StringUtils.trim(query.norm()),
      "§(\\d+)",
      "§ $1"
    );
    List<FieldOfLaw> orderedList = orderResults(textTerms, normParagraphsWithSpace, searchResult);
    return PageTransformer.transform(
      new PageImpl<>(orderedList, searchResult.getPageable(), searchResult.getTotalElements())
    );
  }

  @Override
  @Transactional(readOnly = true)
  public Page<LegalPeriodical> findLegalPeriodicals(@Nonnull LegalPeriodicalQuery query) {
    QueryOptions queryOptions = query.queryOptions();
    String searchTerm = query.searchTerm();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);
    var legalPeriodicals = StringUtils.isBlank(searchTerm)
      ? legalPeriodicalsRepository.findAll(pageable)
      : legalPeriodicalsRepository.findByAbbreviationContainingIgnoreCaseOrTitleContainingIgnoreCase(
        searchTerm,
        searchTerm,
        pageable
      );

    return PageTransformer.transform(legalPeriodicals, mapLegalPeriodicalEntity());
  }

  private Function<LegalPeriodicalEntity, LegalPeriodical> mapLegalPeriodicalEntity() {
    return legalPeriodicalEntity ->
      new LegalPeriodical(
        legalPeriodicalEntity.getId(),
        legalPeriodicalEntity.getAbbreviation(),
        legalPeriodicalEntity.getPublicId(),
        legalPeriodicalEntity.getTitle(),
        legalPeriodicalEntity.getSubtitle(),
        legalPeriodicalEntity.getCitationStyle()
      );
  }

  @Override
  @Transactional(readOnly = true)
  public List<LegalPeriodical> findLegalPeriodicalsByAbbreviation(@Nonnull String abbreviation) {
    LegalPeriodicalEntity probe = new LegalPeriodicalEntity();
    probe.setAbbreviation(abbreviation);
    return legalPeriodicalsRepository
      .findAll(Example.of(probe))
      .stream()
      .map(mapLegalPeriodicalEntity())
      .toList();
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Region> findRegions(@Nonnull RegionQuery query) {
    QueryOptions queryOptions = query.queryOptions();
    String searchTerm = query.searchTerm();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);
    var regions = StringUtils.isBlank(searchTerm)
      ? regionRepository.findAll(pageable)
      : regionRepository.findByCodeContainingIgnoreCase(searchTerm, pageable);

    return PageTransformer.transform(regions, mapRegionEntity());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<Region> findRegionByCode(@Nonnull String code) {
    return regionRepository.findByCode(code).map(mapRegionEntity());
  }

  private Function<RegionEntity, Region> mapRegionEntity() {
    return regionEntity ->
      new Region(regionEntity.getId(), regionEntity.getCode(), regionEntity.getLongText());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Institution> findInstitutions(@Nonnull InstitutionQuery query) {
    QueryOptions queryOptions = query.queryOptions();
    String searchTerm = query.searchTerm();
    Sort sort = Sort.by(queryOptions.sortDirection(), queryOptions.sortByProperty());
    Pageable pageable = queryOptions.usePagination()
      ? PageRequest.of(queryOptions.pageNumber(), queryOptions.pageSize(), sort)
      : Pageable.unpaged(sort);
    var institutions = StringUtils.isBlank(searchTerm)
      ? institutionRepository.findAll(pageable)
      : institutionRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
    return PageTransformer.transform(institutions, mapInstitutionEntity());
  }

  @Override
  @Transactional(readOnly = true)
  public Optional<Institution> findInstitutionByNameAndType(
    @Nonnull String name,
    @Nonnull InstitutionType institutionType
  ) {
    return institutionRepository
      .findByNameAndType(name, mapInstitutionType(institutionType))
      .map(mapInstitutionEntity());
  }

  @Override
  @Transactional(readOnly = true)
  public Page<Court> findCourts(@Nonnull CourtQuery query) {
    log.info("Ignoring given query as mocked result is returned always: {}.", query);
    return new Page<>(
      List.of(
        new Court(UUID.fromString("0e1b035-a7f4-4d88-b5c0-a7d0466b8752"), "AG", "Aachen"),
        new Court(
          UUID.fromString("8163531c-2c51-410a-9591-b45b004771da"),
          "Berufsgericht für Architekten",
          "Bremen"
        )
      ),
      2,
      0,
      2,
      2,
      true,
      true,
      false
    );
  }

  private Function<InstitutionEntity, Institution> mapInstitutionEntity() {
    return institutionEntity ->
      new Institution(
        institutionEntity.getId(),
        institutionEntity.getName(),
        institutionEntity.getOfficialName(),
        mapInstitutionTypeString(institutionEntity.getType()),
        institutionEntity.getRegions().stream().map(mapRegionEntity()).toList()
      );
  }

  private List<String> splitSearchTerms(String searchStr) {
    return searchStr != null ? List.of(searchStr.split("\\s+")) : List.of();
  }

  private List<FieldOfLaw> orderResults(
    List<String> textTerms,
    String normParagraphsWithSpace,
    org.springframework.data.domain.Page<FieldOfLaw> searchResult
  ) {
    // Calculate scores and sort the list based on the score and identifier
    List<ScoredFieldOfLaw> scores = calculateScore(
      textTerms,
      normParagraphsWithSpace,
      searchResult.getContent()
    );
    return scores
      .stream()
      .sorted(
        Comparator.comparing(ScoredFieldOfLaw::score).thenComparing(scoredFieldOfLaw ->
          scoredFieldOfLaw.fieldOfLaw().identifier()
        )
      )
      .map(ScoredFieldOfLaw::fieldOfLaw)
      .toList();
  }

  private List<ScoredFieldOfLaw> calculateScore(
    List<String> textTerms,
    String normParagraphsWithSpace,
    List<FieldOfLaw> fieldsOfLaw
  ) {
    List<ScoredFieldOfLaw> scoredFieldsOfLaw = new ArrayList<>();
    fieldsOfLaw.forEach(fieldOfLaw -> {
      int score = 0;
      for (String textTerm : textTerms) {
        score += calculateScoreByTextTerm(fieldOfLaw, textTerm);
      }
      if (normParagraphsWithSpace != null) {
        score += calculateScoreByNormWithParagraphs(fieldOfLaw, normParagraphsWithSpace);
      }
      scoredFieldsOfLaw.add(new ScoredFieldOfLaw(fieldOfLaw, score));
    });
    return scoredFieldsOfLaw;
  }

  private int calculateScoreByTextTerm(@Nonnull FieldOfLaw fieldOfLaw, @Nonnull String textTerm) {
    int score = 0;
    textTerm = textTerm.toLowerCase();
    String text = fieldOfLaw.text().toLowerCase();
    if (text.startsWith(textTerm)) score += 5;
    // split by whitespace and hyphen to get words
    for (String textPart : text.split("[\\s-]+")) {
      if (textPart.equals(textTerm)) score += 4;
      else if (textPart.startsWith(textTerm)) score += 3;
      else if (textPart.contains(textTerm)) score += 1;
    }
    return score;
  }

  private int calculateScoreByNormWithParagraphs(
    @Nonnull FieldOfLaw fieldOfLaw,
    @Nonnull String normWithParagraphs
  ) {
    int score = 0;
    var normWithParagraphsLowerCase = normWithParagraphs.toLowerCase();
    for (Norm norm : fieldOfLaw.norms()) {
      String description = norm.singleNormDescription() == null
        ? ""
        : norm.singleNormDescription().toLowerCase();
      String normText = description + " " + norm.abbreviation().toLowerCase();
      if (description.equals(normWithParagraphsLowerCase)) score += 8;
      else if (description.startsWith(normWithParagraphsLowerCase)) score += 5;
      else if (normText.contains(normWithParagraphsLowerCase)) score += 5;
    }
    return score;
  }

  record ScoredFieldOfLaw(@Nonnull FieldOfLaw fieldOfLaw, @Nonnull Integer score) {}
}

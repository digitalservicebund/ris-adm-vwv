package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import java.util.*;
import javax.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.RegExUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class LookupTablesPersistenceService implements LookupTablesPersistencePort {

  private final DocumentTypesRepository documentTypesRepository;
  private final FieldOfLawRepository fieldOfLawRepository;

  @Override
  @Transactional(readOnly = true)
  public Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query) {
    PageQuery pageQuery = query.pageQuery();
    String searchQuery = query.searchQuery();
    Sort sort = Sort.by(pageQuery.sortDirection(), pageQuery.sortBy());
    Pageable pageable = pageQuery.paged()
      ? PageRequest.of(pageQuery.page(), pageQuery.size(), sort)
      : Pageable.unpaged(sort);
    Page<DocumentTypeEntity> documentTypes = StringUtils.isBlank(searchQuery)
      ? documentTypesRepository.findAll(pageable)
      : documentTypesRepository.findByAbbreviationContainingIgnoreCaseOrNameContainingIgnoreCase(
        searchQuery,
        searchQuery,
        pageable
      );

    return documentTypes.map(documentTypeEntity ->
      new DocumentType(documentTypeEntity.getAbbreviation(), documentTypeEntity.getName())
    );
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
    PageQuery pageQuery = query.pageQuery();
    Sort sort = Sort.by(pageQuery.sortDirection(), pageQuery.sortBy());
    Pageable pageable = pageQuery.paged()
      ? PageRequest.of(pageQuery.page(), pageQuery.size(), sort)
      : Pageable.unpaged(sort);

    List<String> textTerms = splitSearchTerms(query.text());
    List<String> normTerms = splitSearchTerms(
      StringUtils.trimToNull(StringUtils.replace(query.norm(), "§", ""))
    );
    FieldOfLawSpecification fieldOfLawSpecification = new FieldOfLawSpecification(
      query.identifier(),
      textTerms,
      normTerms
    );
    Page<FieldOfLaw> unorderedList = fieldOfLawRepository
      .findAll(fieldOfLawSpecification, pageable)
      .map(fieldOfLawEntity ->
        FieldOfLawTransformer.transformToDomain(fieldOfLawEntity, false, true)
      );

    if (unorderedList.isEmpty()) {
      // If no results found, do not re-sort result
      return unorderedList;
    }

    String normParagraphsWithSpace = RegExUtils.replaceAll(
      StringUtils.trim(query.identifier()),
      "§(\\d+)",
      "§ $1"
    );
    List<FieldOfLaw> orderedList = orderResults(textTerms, normParagraphsWithSpace, unorderedList);
    return new PageImpl<>(
      orderedList,
      unorderedList.getPageable(),
      unorderedList.getTotalElements()
    );
  }

  private List<String> splitSearchTerms(String searchStr) {
    return searchStr != null ? List.of(searchStr.split("\\s+")) : List.of();
  }

  private List<FieldOfLaw> orderResults(
    List<String> textTerms,
    String normParagraphsWithSpace,
    Page<FieldOfLaw> unorderedList
  ) {
    // Calculate scores and sort the list based on the score and identifier
    List<ScoredFieldOfLaw> scores = calculateScore(
      textTerms,
      normParagraphsWithSpace,
      unorderedList.getContent()
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
    List<FieldOfLaw> fieldOfLaws
  ) {
    List<ScoredFieldOfLaw> scoredFieldOfLaws = new ArrayList<>();
    fieldOfLaws.forEach(fieldOfLaw -> {
      int score = 0;
      for (String textTerm : textTerms) {
        score += calculateScoreByTextTerm(fieldOfLaw, textTerm);
      }
      if (normParagraphsWithSpace != null) {
        score += calculateScoreByNormWithParagraphs(fieldOfLaw, normParagraphsWithSpace);
      }
      scoredFieldOfLaws.add(new ScoredFieldOfLaw(fieldOfLaw, score));
    });
    return scoredFieldOfLaws;
  }

  private int calculateScoreByTextTerm(@Nonnull FieldOfLaw fieldOfLaw, @Nonnull String textTerm) {
    int score = 0;
    textTerm = textTerm.toLowerCase();
    String text = fieldOfLaw.text().toLowerCase();
    if (text.startsWith(textTerm)) score += 5;
    // split by whitespace and hyphen to get words
    for (String textPart : text.split("[\\s-]+")) {
      if (textPart.equals(textTerm)) score += 4;
      if (textPart.startsWith(textTerm)) score += 3;
      if (textPart.contains(textTerm)) score += 1;
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
      // TODO: Check if norm.singleNormDescription can ever be null
      String description = norm.singleNormDescription() == null
        ? ""
        : norm.singleNormDescription().toLowerCase();
      String normText = description + " " + norm.abbreviation().toLowerCase();
      if (description.equals(normWithParagraphsLowerCase)) score += 8;
      if (description.startsWith(normWithParagraphsLowerCase)) score += 5;
      if (normText.contains(normWithParagraphsLowerCase)) score += 5;
    }
    return score;
  }

  record ScoredFieldOfLaw(@Nonnull FieldOfLaw fieldOfLaw, @Nonnull Integer score) {}
}

package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import jakarta.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;

@RequiredArgsConstructor
public class FieldOfLawSpecification implements Specification<FieldOfLawEntity> {

  private final String identifier;
  private final List<String> textTerms;
  private final List<String> normTerms;

  @Override
  public Predicate toPredicate(
    @Nonnull Root<FieldOfLawEntity> root,
    CriteriaQuery<?> query,
    @Nonnull CriteriaBuilder criteriaBuilder
  ) {
    ArrayList<Predicate> predicates = new ArrayList<>();

    Predicate notationPredicate = criteriaBuilder.equal(
      root.get("notation"),
      criteriaBuilder.literal("NEW")
    );
    predicates.add(notationPredicate);

    if (textTerms != null) {
      for (String searchTerm : textTerms) {
        predicates.add(
          criteriaBuilder.like(
            criteriaBuilder.lower(root.get("text")),
            "%" + searchTerm.toLowerCase() + "%"
          )
        );
      }
    }
    if (identifier != null) {
      Predicate identifierPredicate = criteriaBuilder.like(
        root.get("identifier"),
        identifier.toUpperCase() + "%"
      );
      predicates.add(identifierPredicate);
    }
    if (normTerms != null) {
      root.fetch("norms", JoinType.LEFT);
      for (String searchTerm : normTerms) {
        Predicate normAbbreviationPredicate = criteriaBuilder.like(
          criteriaBuilder.lower(root.get("norms").get("abbreviation")),
          "%" + searchTerm.toLowerCase() + "%"
        );
        Predicate singleNormPredicate = criteriaBuilder.like(
          criteriaBuilder.lower(root.get("norms").get("singleNormDescription")),
          "%" + searchTerm.toLowerCase() + "%"
        );
        Predicate combined = criteriaBuilder.or(normAbbreviationPredicate, singleNormPredicate);
        predicates.add(combined);
      }
    }
    return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
  }
}

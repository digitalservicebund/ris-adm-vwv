package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw.FieldOfLawBuilder;
import de.bund.digitalservice.ris.adm_vwv.application.Norm;
import java.util.Collections;
import java.util.List;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FieldOfLawTransformer {

  public static FieldOfLaw transformToDomain(
    FieldOfLawEntity fieldOfLawEntity,
    boolean withChildren,
    boolean withNorms
  ) {
    FieldOfLawBuilder builder = FieldOfLaw.builder()
      .id(fieldOfLawEntity.getId())
      .identifier(fieldOfLawEntity.getIdentifier())
      .text(fieldOfLawEntity.getText());
    if (fieldOfLawEntity.getParent() != null) {
      builder.parent(transformToDomain(fieldOfLawEntity.getParent(), false, false));
    }
    builder.hasChildren(!fieldOfLawEntity.getChildren().isEmpty());
    if (withChildren) {
      List<FieldOfLaw> children = fieldOfLawEntity
        .getChildren()
        .stream()
        .map(fol -> FieldOfLawTransformer.transformToDomain(fol, false, withNorms))
        .toList();
      builder.children(children);
      builder.hasChildren(true);
    } else {
      builder.children(Collections.emptyList());
    }
    if (withNorms) {
      List<Norm> norms = fieldOfLawEntity
        .getNorms()
        .stream()
        .map(fieldOfLawNormEntity ->
          Norm.builder()
            .abbreviation(fieldOfLawNormEntity.getAbbreviation())
            .singleNormDescription(fieldOfLawNormEntity.getSingleNormDescription())
            .build()
        )
        .toList();
      builder.norms(norms);
    }
    return builder.build();
  }
}

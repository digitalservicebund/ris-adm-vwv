package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormReference;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.SingleNorm;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Analysis;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.OtherReferences;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

/**
 * Transformer for norms references (in German 'Normenkette').
 */
@RequiredArgsConstructor
public class NormReferencesTransformer {

  private final AkomaNtoso akomaNtoso;

  /**
   * Transforms the {@code AkomaNtoso} object to a list of norm references.
   *
   * @return The list of {@code <NormReference>} elements.
   */
  public List<NormReference> transform() {
    Analysis analysis = akomaNtoso.getDoc().getMeta().getAnalysis();
    if (analysis == null) {
      return List.of();
    }

    List<OtherReferences> otherReferences = analysis.getOtherReferences();
    if (otherReferences == null) return List.of();

    List<OtherReferences> otherReferencesWithImplicitAndNormReferences = otherReferences
      .stream()
      .filter(or -> or.getImplicitReferences() != null)
      .filter(or ->
        or.getImplicitReferences().stream().anyMatch(ir -> ir.getNormReference() != null)
      )
      .toList();

    if (otherReferencesWithImplicitAndNormReferences.isEmpty()) return List.of();

    return otherReferencesWithImplicitAndNormReferences
      .stream()
      .flatMap(or -> or.getImplicitReferences().stream())
      .map(implicitReference ->
        new NormReference(
          new NormAbbreviation(
            UUID.randomUUID(),
            implicitReference.getShortForm(),
            implicitReference.getShowAs()
          ),
          implicitReference.getShortForm(),
          List.of(
            new SingleNorm(
              UUID.randomUUID(),
              implicitReference.getNormReference().getSingleNorm(),
              implicitReference.getNormReference().getDateOfVersion(),
              implicitReference.getNormReference().getDateOfRelevance()
            )
          )
        )
      )
      .toList();
  }
}

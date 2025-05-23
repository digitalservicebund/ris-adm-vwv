package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.ActiveCitation;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.CitationType;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Court;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.*;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;

/**
 * Transformer for active citations (in German 'Aktivzitierung
 * Rechtssprechung').
 */
@RequiredArgsConstructor
public class ActiveCitationsTransformer {

  private final AkomaNtoso akomaNtoso;

  /**
   * Transforms the {@code AkomaNtoso} object to a list of active citations.
   *
   * @return Active citations list, or an empty list if the surrounding
   *         {@code <analysis>} element is {@code null}
   */
  public List<ActiveCitation> transform() {
    Analysis analysis = akomaNtoso.getDoc().getMeta().getAnalysis();
    if (analysis == null) {
      return List.of();
    }
    List<OtherReferences> otherReferences = analysis.getOtherReferences();
    return otherReferences
      .stream()
      .map(OtherReferences::getImplicitReference)
      .filter(ir -> ir.getReferenceType() == ImplicitReferenceType.ACTIVE_CITATION)
      .map(ImplicitReference::getCaselawReference)
      .map(cr ->
        new ActiveCitation(
          UUID.randomUUID(),
          false,
          cr.getDocumentNumber(),
          new Court(null, null, cr.getCourtLocation(), cr.getCourt()),
          cr.getDate(),
          cr.getReferenceNumber(),
          null,
          new CitationType(
            null,
            cr.getAbbreviation(),
            cr.getAbbreviation() + " (fulltext not yet implemented)"
          )
        )
      )
      .toList();
  }
}

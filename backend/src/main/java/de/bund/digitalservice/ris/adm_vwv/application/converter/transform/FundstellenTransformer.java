package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.Fundstelle;
import de.bund.digitalservice.ris.adm_vwv.application.LegalPeriodical;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPersistencePort;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Analysis;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.ImplicitReferenceType;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.OtherReferences;
import jakarta.annotation.Nonnull;
import jakarta.annotation.Nullable;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Component;

/**
 * Transformer for 'Fundstellen'.
 */
@RequiredArgsConstructor
@Component
public class FundstellenTransformer {

  private final LookupTablesPersistencePort lookupTablesPersistencePort;

  /**
   * Transforms the {@code AkomaNtoso} object to a list of references.
   *
   * @param akomaNtoso The Akoma Ntoso XML object to transform
   * @return Reference list, or an empty list if the surrounding {@code <analysis>} element is {@code null}
   */
  public List<Fundstelle> transform(@Nonnull AkomaNtoso akomaNtoso) {
    Analysis analysis = akomaNtoso.getDoc().getMeta().getAnalysis();
    if (analysis == null) {
      return List.of();
    }
    List<OtherReferences> otherReferences = analysis.getOtherReferences();
    return otherReferences
      .stream()
      .flatMap(or -> or.getImplicitReferences().stream())
      .filter(ir -> ir.getReferenceType() == ImplicitReferenceType.FUNDSTELLE)
      .map(ir -> {
        String abbreviation = ir.getShortForm();
        LegalPeriodical periodikum = findPeriodikum(abbreviation);
        String zitatstelle = StringUtils.substringAfter(ir.getShowAs(), abbreviation).trim();
        // In case the periodikum is not unique or not existing, the abbreviation is set and displayed in the UI.
        String ambiguousPeriodikum = periodikum == null ? abbreviation : null;
        return new Fundstelle(UUID.randomUUID(), zitatstelle, periodikum, ambiguousPeriodikum);
      })
      .toList();
  }

  @Nullable
  private LegalPeriodical findPeriodikum(String abbreviation) {
    LegalPeriodical periodikum = null;
    List<LegalPeriodical> legalPeriodicals =
      lookupTablesPersistencePort.findLegalPeriodicalsByAbbreviation(abbreviation);
    if (legalPeriodicals.size() == 1) {
      // The legal periodical is only set, if it is found and unambiguous in the database. In case there are multiple
      // legal periodicals with the same abbreviation it is not set which results to a user hint in
      // the UI ("Mehrdeutiger Verweis"). This behaviour is the same as in Caselaw.
      periodikum = legalPeriodicals.getFirst();
    }
    return periodikum;
  }
}

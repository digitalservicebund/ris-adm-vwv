package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.Institution;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPersistencePort;
import de.bund.digitalservice.ris.adm_vwv.application.Region;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Normgeber;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Proprietary;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.RisMetadata;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.RisNormgeber;
import jakarta.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Transformer for 'Normgeber'.
 */
@RequiredArgsConstructor
@Component
public class NormgeberTransformer {

  private final LookupTablesPersistencePort lookupTablesPersistencePort;

  /**
   * Transforms the {@code AkomaNtoso} object to a list of Normgeber.
   *
   * @param akomaNtoso The Akoma Ntoso XML object to transform
   * @return Normgeber list, or an empty list if the surrounding {@code <proprietary>} element is {@code null}
   */
  public List<Normgeber> transform(@Nonnull AkomaNtoso akomaNtoso) {
    List<RisNormgeber> risNormgeberList = Optional.ofNullable(
      akomaNtoso.getDoc().getMeta().getProprietary()
    )
      .map(Proprietary::getMetadata)
      .map(RisMetadata::getNormgeber)
      .orElse(List.of());
    return risNormgeberList
      .stream()
      .map(risNormgeber -> {
        String institutionName = risNormgeber.getOrgan() != null
          ? risNormgeber.getOrgan()
          : risNormgeber.getStaat();
        Institution institution = lookupTablesPersistencePort
          .findInstitutionByName(institutionName)
          .orElseThrow(() ->
            new IllegalArgumentException("Institution not found: " + institutionName)
          );
        List<Region> regions = new ArrayList<>();
        if (risNormgeber.getOrgan() != null) {
          regions.add(
            lookupTablesPersistencePort.findRegionByCode(risNormgeber.getStaat()).orElse(null)
          );
        }
        return new Normgeber(UUID.randomUUID(), institution, regions);
      })
      .toList();
  }
}

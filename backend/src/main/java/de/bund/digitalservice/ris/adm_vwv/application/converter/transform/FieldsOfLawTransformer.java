package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Proprietary;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.RisMetadata;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

/**
 * FieldsOfLaw transformer.
 */
@RequiredArgsConstructor
public class FieldsOfLawTransformer {

  private final AkomaNtoso akomaNtoso;

  /**
   * Transforms the {@code ExpiryDate} object to a string.
   *
   * @return The expiryDate or null if Proprietary or Metadata does not exist
   */
  public List<FieldOfLaw> transform() {
    var fieldsOfLaw = Optional.ofNullable(akomaNtoso.getDoc().getMeta().getProprietary())
      .map(Proprietary::getMetadata)
      .map(RisMetadata::getFieldsOfLaw)
      .orElse(List.of());

    return fieldsOfLaw
      .stream()
      .map(risFieldOfLaw ->
        new FieldOfLaw(
          null,
          false,
          null,
          risFieldOfLaw.getValue(),
          null,
          List.of(),
          List.of(),
          null
        )
      )
      .toList();
  }
}

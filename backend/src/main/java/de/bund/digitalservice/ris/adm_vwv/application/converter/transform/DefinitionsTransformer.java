package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Definition;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Proprietary;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.RisDefinition;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.RisMetadata;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

/**
 * Definitions transformer.
 */
@RequiredArgsConstructor
public class DefinitionsTransformer {

  /**
   * Transforms the {@code AkomaNtoso} object to a list of definitions.
   *
   * @param akomaNtoso The Akoma Ntoso XML object to transform
   * @return The list of definitions (empty if there are none)
   */
  public List<Definition> transform(@Nonnull AkomaNtoso akomaNtoso) {
    List<RisDefinition> risDefinitions = Optional.ofNullable(
      akomaNtoso.getDoc().getMeta().getProprietary()
    )
      .map(Proprietary::getMetadata)
      .map(RisMetadata::getDefinitions)
      .orElse(List.of());

    return risDefinitions
      .stream()
      .map(definition -> new Definition(definition.getBegriff()))
      .toList();
  }
}

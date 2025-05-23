package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.Keyword;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;

/**
 * Expiry date transformer.
 */
@RequiredArgsConstructor
public class KeywordsTransformer {

  private final AkomaNtoso akomaNtoso;

  /**
   * Transforms the {@code Keyword} object to a list of keywords
   *
   * @return The list of keywords (empty if there are none)
   */
  public List<String> transform() {
    return Optional.ofNullable(akomaNtoso.getDoc().getMeta().getClassification())
      .map(classification -> classification.getKeyword().stream().map(Keyword::getValue).toList())
      .orElse(List.of());
  }
}

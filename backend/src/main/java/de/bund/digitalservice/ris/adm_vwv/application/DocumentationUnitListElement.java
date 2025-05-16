package de.bund.digitalservice.ris.adm_vwv.application;

import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.UUID;

/**
 * DocumentationUnitListElement
 *
 * @param id               The uuid of the document unit
 * @param dokumentnummer   The public id of the document unit
 * @param zitierdatum      The date to quote by
 * @param langueberschrift The unabbreviated title of the document unit
 * @param fundstellen      The list of Fundstellen
 */
public record DocumentationUnitListElement(
  @Nonnull UUID id,
  @Nonnull String dokumentnummer,
  String zitierdatum,
  String langueberschrift,
  List<Fundstelle> fundstellen
) {}

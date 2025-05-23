package de.bund.digitalservice.ris.adm_vwv.application;

import jakarta.annotation.Nonnull;

/**
 * Field of law query.
 *
 * @param identifier Identifier to search for
 * @param text Text to search for
 * @param norm Norm to search for
 * @param queryOptions Page query options
 */
public record FieldOfLawQuery(
  String identifier,
  String text,
  String norm,
  @Nonnull QueryOptions queryOptions
) {}

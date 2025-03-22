package de.bund.digitalservice.ris.adm_vwv.application;

import javax.annotation.Nonnull;

public record FieldOfLawQuery(
  String identifier,
  String text,
  String norm,
  @Nonnull PageQuery pageQuery
) {}

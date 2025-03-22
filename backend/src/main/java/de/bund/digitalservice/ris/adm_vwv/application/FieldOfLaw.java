package de.bund.digitalservice.ris.adm_vwv.application;

import java.util.List;
import java.util.UUID;
import javax.annotation.Nonnull;
import lombok.Builder;

@Builder(toBuilder = true)
public record FieldOfLaw(
  @Nonnull UUID id,
  boolean hasChildren,
  @Nonnull String identifier,
  @Nonnull String text,
  @Nonnull List<String> linkedFields,
  @Nonnull List<Norm> norms,
  @Nonnull List<FieldOfLaw> children,
  FieldOfLaw parent
) {}

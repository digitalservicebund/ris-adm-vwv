package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import de.bund.digitalservice.ris.adm_vwv.application.Institution;
import de.bund.digitalservice.ris.adm_vwv.application.Region;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.UUID;

/**
 * Normgeber business record.
 *
 * @param id The uuid
 * @param institution The institution
 * @param regions The list of regions
 */
public record Normgeber(
  @Nonnull UUID id,
  @Nonnull Institution institution,
  @Nonnull List<Region> regions
) {}

package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import jakarta.annotation.Nonnull;
import java.util.List;

/**
 * Field of law response wrapping a list of fields of law.
 *
 * @param fieldsOfLaw Fields of law
 */
public record FieldOfLawResponse(@Nonnull List<FieldOfLaw> fieldsOfLaw) {}

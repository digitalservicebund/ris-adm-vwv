package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import java.util.List;
import javax.annotation.Nonnull;

public record FieldOfLawResponse(@Nonnull List<FieldOfLaw> fieldsOfLaw) {}

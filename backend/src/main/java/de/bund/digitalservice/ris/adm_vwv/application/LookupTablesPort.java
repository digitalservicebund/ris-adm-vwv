package de.bund.digitalservice.ris.adm_vwv.application;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Input port for lookup tables.
 */
public interface LookupTablesPort {
  Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query);

  List<FieldOfLaw> findFieldsOfLawChildren(@Nonnull String identifier);
  List<FieldOfLaw> findFieldsOfLawParents();

  Optional<FieldOfLaw> findFieldOfLaw(@Nonnull String identifier);
  Page<FieldOfLaw> findFieldsOfLaw(@Nonnull FieldOfLawQuery query);

  Page<LegalPeriodical> findLegalPeriodicals(@Nonnull LegalPeriodicalQuery query);

  Page<Region> findRegions(@Nonnull RegionQuery regionQuery);

  Page<Institution> findInstitutions(@Nonnull InstitutionQuery query);

  Page<NormAbbreviation> findNormAbbreviations(@Nonnull NormAbbreviationQuery query);
}

package de.bund.digitalservice.ris.adm_vwv.application;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Optional;

/**
 * Output persistence port for lookup tables.
 */
public interface LookupTablesPersistencePort {
  Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query);
  Optional<DocumentType> findDocumentTypeByAbbreviation(@Nonnull String abbreviation);

  List<FieldOfLaw> findFieldsOfLawChildren(@Nonnull String identifier);
  List<FieldOfLaw> findFieldsOfLawParents();

  Optional<FieldOfLaw> findFieldOfLaw(@Nonnull String identifier);

  Page<FieldOfLaw> findFieldsOfLaw(@Nonnull FieldOfLawQuery query);

  Page<LegalPeriodical> findLegalPeriodicals(@Nonnull LegalPeriodicalQuery query);
  List<LegalPeriodical> findLegalPeriodicalsByAbbreviation(@Nonnull String abbreviation);

  Page<Region> findRegions(@Nonnull RegionQuery regionQuery);
  Optional<Region> findRegionByCode(@Nonnull String code);

  Page<Institution> findInstitutions(@Nonnull InstitutionQuery query);
  Optional<Institution> findInstitutionByNameAndType(
    @Nonnull String name,
    @Nonnull InstitutionType type
  );

  Page<NormAbbreviation> findNormAbbreviations(@Nonnull NormAbbreviationQuery query);
}

package de.bund.digitalservice.ris.adm_vwv.application;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Court;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.ReferenceType;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Application service for lookup tables.
 */
@Service
@RequiredArgsConstructor
public class LookupTablesService implements LookupTablesPort {

  private final LookupTablesPersistencePort lookupTablesPersistencePort;

  @Override
  public Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query) {
    return lookupTablesPersistencePort.findDocumentTypes(query);
  }

  @Override
  public List<FieldOfLaw> findFieldsOfLawChildren(@Nonnull String identifier) {
    return lookupTablesPersistencePort.findFieldsOfLawChildren(identifier);
  }

  @Override
  public List<FieldOfLaw> findFieldsOfLawParents() {
    return lookupTablesPersistencePort.findFieldsOfLawParents();
  }

  @Override
  public Optional<FieldOfLaw> findFieldOfLaw(@Nonnull String identifier) {
    return lookupTablesPersistencePort.findFieldOfLaw(identifier);
  }

  @Override
  public Page<FieldOfLaw> findFieldsOfLaw(@Nonnull FieldOfLawQuery query) {
    return lookupTablesPersistencePort.findFieldsOfLaw(query);
  }

  @Override
  public Page<LegalPeriodical> findLegalPeriodicals(@Nonnull LegalPeriodicalQuery query) {
    return lookupTablesPersistencePort.findLegalPeriodicals(query);
  }

  @Override
  public Page<Region> findRegions(@Nonnull RegionQuery regionQuery) {
    return lookupTablesPersistencePort.findRegions(regionQuery);
  }

  @Override
  public Page<Institution> findInstitutions(@Nonnull InstitutionQuery query) {
    return lookupTablesPersistencePort.findInstitutions(query);
  }

  @Override
  public Page<Court> findCourts(@Nonnull CourtQuery query) {
    return lookupTablesPersistencePort.findCourts(query);
  }

  @Override
  public Page<NormAbbreviation> findNormAbbreviations(@Nonnull NormAbbreviationQuery query) {
    return lookupTablesPersistencePort.findNormAbbreviations(query);
  }

  @Override
  public Page<ReferenceType> findReferenceTypes(@Nonnull ReferenceTypeQuery query) {
    return lookupTablesPersistencePort.findReferenceTypes(query);
  }
}

package de.bund.digitalservice.ris.adm_vwv.application;

import javax.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

/**
 * Application service for lookup tables.
 */
@Service
@RequiredArgsConstructor
public class LookupTablesService implements LookupTablesPort {

  private final LookupTablesPersistencePort lookupTablesPersistencePort;

  @Override
  public Page<DocumentType> findBySearchTerm(@Nonnull DocumentTypeQuery query) {
    return lookupTablesPersistencePort.findBySearchQuery(query);
  }
}

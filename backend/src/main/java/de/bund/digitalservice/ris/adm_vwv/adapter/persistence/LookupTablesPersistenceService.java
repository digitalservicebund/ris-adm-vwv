package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeQuery;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPersistencePort;
import de.bund.digitalservice.ris.adm_vwv.application.PageQuery;
import javax.annotation.Nonnull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

/**
 * Persistence service for lookup tables
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LookupTablesPersistenceService implements LookupTablesPersistencePort {

  private final DocumentTypesRepository documentTypesRepository;

  @Override
  public Page<DocumentType> findBySearchQuery(@Nonnull DocumentTypeQuery query) {
    PageQuery pageQuery = query.pageQuery();
    String searchQuery = query.searchQuery();
    Sort sort = Sort.by(pageQuery.sortDirection(), pageQuery.sortBy());
    Pageable pageable = pageQuery.paged()
      ? PageRequest.of(pageQuery.page(), pageQuery.size(), sort)
      : Pageable.unpaged(sort);
    Page<DocumentTypeEntity> documentTypes = StringUtils.isBlank(searchQuery)
      ? documentTypesRepository.findAll(pageable)
      : documentTypesRepository.findByAbbreviationContainingIgnoreCaseOrNameContainingIgnoreCase(
        searchQuery,
        searchQuery,
        pageable
      );

    return documentTypes.map(documentTypeEntity ->
      new DocumentType(documentTypeEntity.getAbbreviation(), documentTypeEntity.getName())
    );
  }
}

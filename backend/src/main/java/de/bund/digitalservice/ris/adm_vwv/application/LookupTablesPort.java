package de.bund.digitalservice.ris.adm_vwv.application;

import javax.annotation.Nonnull;
import org.springframework.data.domain.Page;

/**
 * Input port for document types.
 */
public interface LookupTablesPort {
  Page<DocumentType> findBySearchTerm(@Nonnull DocumentTypeQuery query);
}

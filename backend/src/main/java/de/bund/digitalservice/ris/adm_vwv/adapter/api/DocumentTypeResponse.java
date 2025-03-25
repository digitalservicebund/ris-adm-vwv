package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import java.util.List;
import org.springframework.data.domain.Page;

/**
 * Response with DocumentTypes and pagination information
 *
 * @param documentTypes List of document types
 * @param paginatedDocumentTypes List of paginated document types
 */
public record DocumentTypeResponse(
  List<DocumentType> documentTypes,
  Page<DocumentType> paginatedDocumentTypes
) {}

package de.bund.digitalservice.ris.adm_vwv.application;

import java.util.List;
import java.util.Optional;
import javax.annotation.Nonnull;
import org.springframework.data.domain.Page;

public interface LookupTablesPersistencePort {
  Page<DocumentType> findDocumentTypes(@Nonnull DocumentTypeQuery query);

  List<FieldOfLaw> findFieldsOfLawChildren(@Nonnull String identifier);
  List<FieldOfLaw> findFieldsOfLawParents();

  Optional<FieldOfLaw> findFieldOfLaw(@Nonnull String identifier);

  Page<FieldOfLaw> findFieldsOfLaw(@Nonnull FieldOfLawQuery query);
}

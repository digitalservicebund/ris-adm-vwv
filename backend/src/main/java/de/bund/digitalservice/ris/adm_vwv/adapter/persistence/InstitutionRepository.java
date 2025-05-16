package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import java.util.Optional;
import java.util.UUID;
import javax.annotation.Nonnull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface InstitutionRepository extends JpaRepository<InstitutionEntity, UUID> {
  Page<InstitutionEntity> findByNameContainingIgnoreCase(
    @Nonnull String name,
    @Nonnull Pageable pageable
  );
  Optional<InstitutionEntity> findByName(@Nonnull String name);
}

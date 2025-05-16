package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import java.util.Optional;
import java.util.UUID;
import javax.annotation.Nonnull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

interface RegionRepository extends JpaRepository<RegionEntity, UUID> {
  Page<RegionEntity> findByCodeContainingIgnoreCase(
    @Nonnull String code,
    @Nonnull Pageable pageable
  );

  Optional<RegionEntity> findByCode(@Nonnull String code);
}

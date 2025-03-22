package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.*;
import org.springframework.data.annotation.Immutable;

@Data
@Entity
@Table(name = "field_of_law_norm_view")
@Immutable
public class FieldOfLawNormEntity {

  @Id
  private UUID id;

  private String abbreviation;

  private String singleNormDescription;

  @ManyToOne
  @JoinColumn(name = "field_of_law_id")
  private FieldOfLawEntity fieldOfLaw;
}

package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import jakarta.persistence.*;
import java.util.*;
import lombok.*;
import org.springframework.data.annotation.Immutable;

@Data
@Entity
@EqualsAndHashCode(exclude = { "children", "parent", "norms" })
@ToString(exclude = "children")
@Table(name = "field_of_law_view")
@Immutable
public class FieldOfLawEntity {

  @Id
  private UUID id;

  private String identifier;

  private String text;

  @OneToMany(mappedBy = "fieldOfLaw", fetch = FetchType.LAZY)
  private Set<FieldOfLawNormEntity> norms = new HashSet<>();

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinTable(
    name = "field_of_law_field_of_law_parent_view",
    joinColumns = @JoinColumn(name = "field_of_law_id"),
    inverseJoinColumns = @JoinColumn(name = "field_of_law_parent_id")
  )
  private FieldOfLawEntity parent;

  @OneToMany(fetch = FetchType.LAZY, mappedBy = "parent")
  @OrderBy("identifier")
  private Set<FieldOfLawEntity> children = new HashSet<>();

  private Integer jurisId;

  private String notation;
}

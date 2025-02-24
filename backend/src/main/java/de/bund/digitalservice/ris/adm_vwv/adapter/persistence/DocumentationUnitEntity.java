package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import jakarta.persistence.*;
import java.time.Year;
import java.util.UUID;
import lombok.Data;

@Entity
@Data
@Table(name = "documentation_unit")
public class DocumentationUnitEntity {

  @Id
  @GeneratedValue
  private UUID id;

  @Basic(optional = false)
  private String documentNumber;

  @Basic
  private String json;

  @Basic(optional = false)
  private Year year;
}

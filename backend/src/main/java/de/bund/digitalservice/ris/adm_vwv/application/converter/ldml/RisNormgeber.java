package de.bund.digitalservice.ris.adm_vwv.application.converter.ldml;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlAttribute;
import lombok.Data;

/**
 * Jaxb ris:normgeber element.
 */
@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class RisNormgeber {

  /**
   * 'Staat' is an attribute for name for legal entity (in German 'Juristische Person') or region.
   */
  @XmlAttribute
  private String staat;

  /**
   * 'Organ' is an attribute for name of institution. If set, then attribute {@link #staat} is the selected region.
   */
  @XmlAttribute
  private String organ;
}

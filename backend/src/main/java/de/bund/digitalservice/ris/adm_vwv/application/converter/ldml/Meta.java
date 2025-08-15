package de.bund.digitalservice.ris.adm_vwv.application.converter.ldml;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import java.util.List;
import lombok.Data;

/**
 * Jaxb meta element.
 */
@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class Meta {

  @XmlElement(namespace = XmlNamespace.AKN_NS)
  private Identification identification;

  @XmlElement(namespace = XmlNamespace.AKN_NS)
  private Classification classification;

  @XmlElement(namespace = XmlNamespace.AKN_NS)
  private Analysis analysis;

  @XmlElement(namespace = XmlNamespace.AKN_NS)
  private Proprietary proprietary;

  /**
   * Returns the set proprietary instance or creates and sets a new one including an instance
   * of {@link RisMetadata}.
   *
   * @return Instance of {@code Proprietary}
   */
  public Proprietary getOrCreateProprietary() {
    if (proprietary == null) {
      proprietary = new Proprietary();
      proprietary.setMetadata(new RisMetadata());
    }
    return proprietary;
  }

  /**
   * Returns the set analysis instance or creates and sets a new one including an instance
   * of {@link OtherReferences}.
   *
   * @return Instance of {@code Analysis}
   */
  public Analysis getOrCreateAnalysis() {
    if (analysis == null) {
      analysis = new Analysis();
      analysis.setOtherReferences(List.of(new OtherReferences()));
    }
    return analysis;
  }
}

package de.bund.digitalservice.ris.adm_vwv.application.converter.ldml;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlElementWrapper;
import java.util.List;
import lombok.*;

/**
 * Jaxb ris:metadata element.
 */
@Data
@XmlAccessorType(XmlAccessType.FIELD)
public class RisMetadata {

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private List<RisNormgeber> normgeber;

  @XmlElementWrapper(name = "fieldsOfLaw", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "fieldOfLaw", namespace = XmlNamespace.RIS_NS)
  private List<RisFieldOfLaw> fieldsOfLaw;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private String entryIntoEffectDate;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private String expiryDate;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private RisDocumentType documentType;

  @XmlElementWrapper(name = "tableOfContentsEntries", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "tableOfContentsEntry", namespace = XmlNamespace.RIS_NS)
  private List<String> tableOfContentsEntries;

  @XmlElementWrapper(name = "zuordnungen", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "zuordnung", namespace = XmlNamespace.RIS_NS)
  private List<RisZuordnung> zuordnungen;

  @XmlElementWrapper(name = "dateToQuoteList", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "dateToQuoteEntry", namespace = XmlNamespace.RIS_NS)
  private List<String> dateToQuoteList;

  @XmlElementWrapper(name = "referenceNumbers", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "referenceNumber", namespace = XmlNamespace.RIS_NS)
  private List<String> referenceNumbers;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private JaxbHtml historicAdministrativeData;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private String region;

  @XmlElement(namespace = XmlNamespace.RIS_NS)
  private String historicAbbreviation;

  @XmlElementWrapper(name = "activeReferences", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "activeReference", namespace = XmlNamespace.RIS_NS)
  private List<RisActiveReference> activeReferences;

  @XmlElementWrapper(name = "berufsbilder", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "berufsbild", namespace = XmlNamespace.RIS_NS)
  private List<String> berufsbilder;

  @XmlElementWrapper(name = "titelAspekt", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "begriff", namespace = XmlNamespace.RIS_NS)
  private List<String> titelAspekt;

  @XmlElementWrapper(name = "definitions", namespace = XmlNamespace.RIS_NS)
  @XmlElement(name = "definition", namespace = XmlNamespace.RIS_NS)
  private List<RisDefinition> definitions;
}

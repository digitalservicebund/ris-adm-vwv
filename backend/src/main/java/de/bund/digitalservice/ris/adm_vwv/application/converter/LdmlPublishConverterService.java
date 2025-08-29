package de.bund.digitalservice.ris.adm_vwv.application.converter;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.Fundstelle;
import de.bund.digitalservice.ris.adm_vwv.application.InstitutionType;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.adapter.NodeToList;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Service;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

/**
 * LDML publish converter service for transforming business models into XML/LDML keeping migrated content
 * not included in the business model like 'Verwaltungsdaten'.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LdmlPublishConverterService {

  private final XmlReader xmlReader;
  private final XmlWriter xmlWriter;
  private final DomXmlReader domXmlReader = new DomXmlReader();

  /**
   * Converts the given business model to LDML xml.
   *
   * @param documentationUnitContent The documentation unit content to convert
   * @param previousXmlVersion       Previous xml version of the documentation unit if it was once published, if not set to {@code null}
   * @return LDML xml representation of the given documentation unit content
   */
  public String convertToLdml(
    @Nonnull DocumentationUnitContent documentationUnitContent,
    String previousXmlVersion
  ) {
    AkomaNtoso akomaNtoso;
    if (previousXmlVersion != null) {
      // If there is a previous version it could be a migrated documented. In that case we have to hold some
      // historic data.
      akomaNtoso = xmlReader.readXml(previousXmlVersion);
      RisMetadata previousRisMetadata = akomaNtoso
        .getDoc()
        .getMeta()
        .getProprietary()
        .getMetadata();
      Meta meta = createMeta(documentationUnitContent.documentNumber());
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setHistoricAdministrativeData(
        previousRisMetadata.getHistoricAdministrativeData()
      );
      risMetadata.setHistoricAbbreviation(previousRisMetadata.getHistoricAbbreviation());
      risMetadata.setZuordnungen(previousRisMetadata.getZuordnungen());
      risMetadata.setRegion(previousRisMetadata.getRegion());
      normalizeHistoricAdministrativeData(meta);
      akomaNtoso.getDoc().setMeta(meta);
      akomaNtoso.getDoc().setPreface(new Preface());
      akomaNtoso.getDoc().setMainBody(new MainBody());
    } else {
      akomaNtoso = createAkomaNtoso(documentationUnitContent);
    }
    Meta meta = akomaNtoso.getDoc().getMeta();
    setInkrafttretedatum(meta, documentationUnitContent.inkrafttretedatum());
    setAusserkrafttretedatum(meta, documentationUnitContent.ausserkrafttretedatum());
    setZitierdaten(meta, documentationUnitContent.zitierdaten());
    setLangueberschrift(
      akomaNtoso.getDoc().getPreface(),
      documentationUnitContent.langueberschrift()
    );
    setGliederung(meta, documentationUnitContent.gliederung());
    setKurzreferat(akomaNtoso.getDoc().getMainBody(), documentationUnitContent.kurzreferat());
    setNormgeber(meta, documentationUnitContent.normgeberList());
    setClassification(meta, documentationUnitContent.keywords());
    setSachgebiete(meta, documentationUnitContent.fieldsOfLaw());
    setDocumentType(
      meta,
      documentationUnitContent.dokumenttyp(),
      documentationUnitContent.dokumenttypZusatz()
    );
    setAktenzeichen(meta, documentationUnitContent.aktenzeichen());
    setFundstellen(meta, documentationUnitContent.fundstellen());
    setNormReferences(meta, documentationUnitContent.normReferences());
    setCaselawReferences(meta, documentationUnitContent.activeCitations());
    setActiveReferences(meta, documentationUnitContent.activeReferences());
    setIdentification(meta, documentationUnitContent);
    setBerufsbilder(meta, documentationUnitContent.berufsbilder());
    setTitelAspekt(meta, documentationUnitContent.titelAspekt());
    setDefinitions(meta, documentationUnitContent.definitions());
    return xmlWriter.writeXml(akomaNtoso);
  }

  private String unescapeHtml(String input) {
    return input == null
      ? null
      : input
        .replace("&nbsp;", "\u00A0")
        .replace("&auml;", "ä")
        .replace("&ouml;", "ö")
        .replace("&uuml;", "ü")
        .replace("&szlig;", "ß")
        .replace("&copy;", "©")
        .replace("&euro;", "€");
  }

  private AkomaNtoso createAkomaNtoso(@Nonnull DocumentationUnitContent documentationUnitContent) {
    AkomaNtoso akomaNtoso;
    akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = createMeta(documentationUnitContent.documentNumber());
    doc.setMeta(meta);
    doc.setPreface(new Preface());
    doc.setMainBody(new MainBody());
    return akomaNtoso;
  }

  private Meta createMeta(String documentNumber) {
    Meta meta = new Meta();
    Identification identification = new Identification();
    FrbrElement frbrExpression = new FrbrElement();
    FrbrAlias frbrAlias = new FrbrAlias();
    frbrAlias.setName("documentNumber");
    frbrAlias.setValue(documentNumber);
    frbrExpression.setFrbrAlias(List.of(frbrAlias));
    identification.setFrbrExpression(frbrExpression);
    meta.setIdentification(identification);
    return meta;
  }

  private void setInkrafttretedatum(Meta meta, String inkrafttretedatum) {
    if (inkrafttretedatum != null) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setEntryIntoEffectDate(inkrafttretedatum);
    }
  }

  private void setAusserkrafttretedatum(Meta meta, String ausserkrafttretedatum) {
    if (ausserkrafttretedatum != null) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setExpiryDate(ausserkrafttretedatum);
    }
  }

  private void setZitierdaten(Meta meta, List<String> zitierdaten) {
    if (CollectionUtils.isNotEmpty(zitierdaten)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setDateToQuoteList(zitierdaten);
    }
  }

  private void setLangueberschrift(Preface preface, String langueberschrift) {
    LongTitle longTitle = new LongTitle();
    preface.setLongTitle(longTitle);
    JaxbHtml jaxbHtml = new JaxbHtml();
    jaxbHtml.setName("longTitle");
    longTitle.setBlock(jaxbHtml);
    jaxbHtml.setHtml(List.of(unescapeHtml(langueberschrift)));
  }

  private void setGliederung(Meta meta, String gliederung) {
    if (StringUtils.isNotBlank(gliederung)) {
      List<String> entries = Pattern.compile("<p>(.*?)</p>")
        .matcher(gliederung)
        .results()
        .map(matchResult -> unescapeHtml(matchResult.group(1)))
        .toList();
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setTableOfContentsEntries(entries);
    }
  }

  private void setKurzreferat(MainBody mainBody, String kurzreferat) {
    if (StringUtils.isBlank(kurzreferat)) {
      JaxbHtml hcontainer = new JaxbHtml();
      hcontainer.setName("crossheading");
      mainBody.setHcontainer(hcontainer);
      return;
    }
    JaxbHtml div = new JaxbHtml();
    mainBody.setDiv(div);

    // Some files have complex html logic like style="text-align: center;" so we must handle these cases
    // We only allow paragraphs and line breaks.
    Safelist safelist = Safelist.none().addTags("p", "br");
    String cleanHtml = Jsoup.clean(kurzreferat, safelist);

    // Unescape HTML entities like &nbsp; from the cleaned string
    String unescapedHtml = unescapeHtml(cleanHtml);

    String kurzreferatWithAknNs = unescapedHtml
      .replaceAll("<(/?)p>", "<$1akn:p>")
      .replaceAll("<br\\s*/?>", "<akn:br/>");

    Node node = domXmlReader.readXml("<div>" + kurzreferatWithAknNs + "</div>");
    div.setHtml(
      NodeToList.toList(node.getChildNodes())
        .stream()
        .map(childNode -> {
          if (childNode instanceof Element element) {
            element.setAttributeNS(
              "http://www.w3.org/2000/xmlns/",
              "xmlns:akn",
              XmlNamespace.AKN_NS
            );
            return childNode;
          } else if (
            childNode.getNodeType() == Node.TEXT_NODE &&
            StringUtils.isNotBlank(childNode.getTextContent())
          ) {
            // We only add non-empty text nodes
            return childNode.getTextContent();
          }
          // In case there would be processing instructions or comments
          return null;
        })
        .filter(Objects::nonNull)
        .toList()
    );
  }

  private void setNormgeber(Meta meta, List<Normgeber> normgeberList) {
    if (CollectionUtils.isNotEmpty(normgeberList)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      List<RisNormgeber> risNormgeberList = normgeberList
        .stream()
        .map(normgeber -> {
          RisNormgeber risNormgeber = new RisNormgeber();
          if (normgeber.institution().type() == InstitutionType.INSTITUTION) {
            risNormgeber.setOrgan(normgeber.institution().name());
            risNormgeber.setStaat(normgeber.regions().getFirst().code());
          } else {
            risNormgeber.setStaat(normgeber.institution().name());
          }
          return risNormgeber;
        })
        .toList();
      risMetadata.setNormgeber(risNormgeberList);
    }
  }

  private void setClassification(Meta meta, List<String> keywords) {
    if (CollectionUtils.isNotEmpty(keywords)) {
      Classification classification = new Classification();
      meta.setClassification(classification);
      classification.setKeyword(
        keywords
          .stream()
          .map(keywordValue -> {
            Keyword keyword = new Keyword();
            String sanitizedKeyword = unescapeHtml(keywordValue);
            keyword.setShowAs(sanitizedKeyword);
            keyword.setValue(sanitizedKeyword);
            return keyword;
          })
          .toList()
      );
    }
  }

  private void setSachgebiete(Meta meta, List<FieldOfLaw> fieldsOfLaw) {
    if (CollectionUtils.isNotEmpty(fieldsOfLaw)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setFieldsOfLaw(
        fieldsOfLaw
          .stream()
          .map(fieldOfLaw -> {
            RisFieldOfLaw risFieldOfLaw = new RisFieldOfLaw();
            risFieldOfLaw.setValue(fieldOfLaw.identifier());
            risFieldOfLaw.setNotation(fieldOfLaw.notation());
            return risFieldOfLaw;
          })
          .toList()
      );
    }
  }

  private void setDocumentType(Meta meta, DocumentType dokumenttyp, String dokumenttypZusatz) {
    RisDocumentType risDocumentType = new RisDocumentType();
    risDocumentType.setCategory(dokumenttyp.abbreviation());
    String value = dokumenttyp.abbreviation();
    String sanitizedZusatz = unescapeHtml(dokumenttypZusatz);
    if (StringUtils.isNotBlank(sanitizedZusatz)) {
      risDocumentType.setLongTitle(sanitizedZusatz);
      value += " " + sanitizedZusatz;
    }
    risDocumentType.setValue(value);
    meta.getOrCreateProprietary().getMetadata().setDocumentType(risDocumentType);
  }

  private void setAktenzeichen(Meta meta, List<String> aktenzeichen) {
    if (CollectionUtils.isNotEmpty(aktenzeichen)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setReferenceNumbers(aktenzeichen.stream().map(this::unescapeHtml).toList());
    }
  }

  private void setFundstellen(Meta meta, List<Fundstelle> fundstellen) {
    if (CollectionUtils.isNotEmpty(fundstellen)) {
      OtherReferences otherReferences = meta.getOrCreateAnalysis().getOtherReferences().getFirst();
      otherReferences
        .getImplicitReferences()
        .addAll(
          fundstellen
            .stream()
            .map(fundstelle -> {
              ImplicitReference implicitReference = new ImplicitReference();
              if (fundstelle.periodikum() == null) {
                // Can occur due to ambiguous Periodika. Revisit this case after implementing RISDEV-8915
                String sanitizedAmbiguous = unescapeHtml(fundstelle.ambiguousPeriodikum());
                String sanitizedZitatstelle = unescapeHtml(fundstelle.zitatstelle());
                implicitReference.setShortForm(sanitizedAmbiguous);
                implicitReference.setShowAs(sanitizedAmbiguous + ", " + sanitizedZitatstelle);
              } else {
                String sanitizedZitatstelle = unescapeHtml(fundstelle.zitatstelle());
                implicitReference.setShortForm(fundstelle.periodikum().abbreviation());
                implicitReference.setShowAs(
                  fundstelle.periodikum().abbreviation() + ", " + sanitizedZitatstelle
                );
              }
              return implicitReference;
            })
            .toList()
        );
    }
  }

  private void setNormReferences(Meta meta, List<NormReference> normReferences) {
    if (CollectionUtils.isNotEmpty(normReferences)) {
      OtherReferences otherReferences = meta.getOrCreateAnalysis().getOtherReferences().getFirst();
      otherReferences
        .getImplicitReferences()
        .addAll(
          normReferences
            .stream()
            .flatMap(normReference -> {
              if (CollectionUtils.isNotEmpty(normReference.singleNorms())) {
                return normReference
                  .singleNorms()
                  .stream()
                  .map(singleNorm -> {
                    ImplicitReference implicitReference = new ImplicitReference();
                    String abbreviation = normReference.normAbbreviation().abbreviation();
                    implicitReference.setShortForm(abbreviation);
                    implicitReference.setShowAs(abbreviation + " " + singleNorm.singleNorm());
                    RisNormReference risNormReference = new RisNormReference();
                    risNormReference.setSingleNorm(singleNorm.singleNorm());
                    risNormReference.setDateOfVersion(singleNorm.dateOfVersion());
                    risNormReference.setDateOfRelevance(singleNorm.dateOfRelevance());
                    implicitReference.setNormReference(risNormReference);
                    return implicitReference;
                  });
              }
              ImplicitReference implicitReference = new ImplicitReference();
              String abbreviation = normReference.normAbbreviation().abbreviation();
              implicitReference.setShortForm(abbreviation);
              implicitReference.setShowAs(abbreviation);
              return Stream.of(implicitReference);
            })
            .toList()
        );
    }
  }

  private void setCaselawReferences(Meta meta, List<ActiveCitation> activeCitations) {
    if (CollectionUtils.isNotEmpty(activeCitations)) {
      OtherReferences otherReferences = meta.getOrCreateAnalysis().getOtherReferences().getFirst();
      otherReferences
        .getImplicitReferences()
        .addAll(
          activeCitations
            .stream()
            .map(activeCitation -> {
              ImplicitReference implicitReference = new ImplicitReference();
              String shortForm =
                activeCitation.citationType().label() +
                " " +
                activeCitation.court().label() +
                " " +
                activeCitation.fileNumber();
              implicitReference.setShortForm(shortForm);
              implicitReference.setShowAs(shortForm + " " + activeCitation.decisionDate());
              RisCaselawReference caselawReference = new RisCaselawReference();
              caselawReference.setAbbreviation(activeCitation.citationType().label());
              caselawReference.setCourt(activeCitation.court().label());
              caselawReference.setCourtLocation(activeCitation.court().location());
              caselawReference.setDate(activeCitation.decisionDate());
              caselawReference.setDocumentNumber(activeCitation.documentNumber());
              caselawReference.setReferenceNumber(activeCitation.fileNumber());
              implicitReference.setCaselawReference(caselawReference);
              return implicitReference;
            })
            .toList()
        );
    }
  }

  private void setActiveReferences(Meta meta, List<ActiveReference> activeReferences) {
    if (CollectionUtils.isNotEmpty(activeReferences)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setActiveReferences(
        activeReferences
          .stream()
          .flatMap(activeReference -> {
            if (CollectionUtils.isNotEmpty(activeReference.singleNorms())) {
              return activeReference
                .singleNorms()
                .stream()
                .map(singleNorm -> {
                  RisActiveReference risActiveReference = new RisActiveReference();
                  risActiveReference.setTypeNumber(
                    transformReferenceType(activeReference.referenceType())
                  );
                  risActiveReference.setReference(
                    activeReference.normAbbreviation().abbreviation()
                  );
                  risActiveReference.setParagraph(singleNorm.singleNorm());
                  risActiveReference.setDateOfVersion(singleNorm.dateOfVersion());
                  return risActiveReference;
                });
            }
            RisActiveReference risActiveReference = new RisActiveReference();
            risActiveReference.setTypeNumber(
              transformReferenceType(activeReference.referenceType())
            );
            risActiveReference.setReference(activeReference.normAbbreviation().abbreviation());
            return Stream.of(risActiveReference);
          })
          .toList()
      );
    }
  }

  private void setBerufsbilder(Meta meta, List<String> berufsbilder) {
    if (CollectionUtils.isNotEmpty(berufsbilder)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setBerufsbilder(berufsbilder);
    }
  }

  private void setTitelAspekt(Meta meta, List<String> titelAspekt) {
    if (CollectionUtils.isNotEmpty(titelAspekt)) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setTitelAspekt(titelAspekt);
    }
  }

  private void setDefinitions(Meta meta, List<Definition> definitions) {
    if (CollectionUtils.isNotEmpty(definitions)) {
      List<RisDefinition> risDefinitions = definitions
        .stream()
        .map(definition -> {
          RisDefinition risDefinition = new RisDefinition();
          risDefinition.setBegriff(definition.begriff());
          return risDefinition;
        })
        .toList();

      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setDefinitions(risDefinitions);
    }
  }

  private String transformReferenceType(String referenceType) {
    return switch (referenceType) {
      case "anwendung" -> "01";
      case "neuregelung" -> "31";
      case "rechtsgrundlage" -> "82";
      default -> {
        log.debug("Unhandled reference type: {}", referenceType);
        yield referenceType;
      }
    };
  }

  private void normalizeHistoricAdministrativeData(Meta meta) {
    JaxbHtml historicAdministrativeData = meta
      .getOrCreateProprietary()
      .getMetadata()
      .getHistoricAdministrativeData();
    if (historicAdministrativeData != null) {
      List<?> nodes = historicAdministrativeData.getHtml();
      List<Node> filteredNodes = nodes
        .stream()
        .filter(Node.class::isInstance)
        .map(Node.class::cast)
        .filter(node -> !(node.getNodeType() == Node.TEXT_NODE && node.getTextContent().isBlank()))
        .toList();
      filteredNodes.forEach(this::removeBlankTextNodes);
      historicAdministrativeData.setHtml(filteredNodes);
    }
  }

  private void removeBlankTextNodes(Node node) {
    for (Node childNode : NodeToList.toList(node.getChildNodes())) {
      if (childNode.getNodeType() == Node.TEXT_NODE && childNode.getTextContent().isBlank()) {
        node.removeChild(childNode);
      } else {
        removeBlankTextNodes(childNode);
      }
    }
  }

  private void setIdentification(Meta meta, DocumentationUnitContent documentationUnitContent) {
    Identification identification = new IdentificationConverter()
      .convert(
        documentationUnitContent,
        meta.getOrCreateProprietary().getMetadata().getZuordnungen()
      );
    meta.setIdentification(identification);
  }
}

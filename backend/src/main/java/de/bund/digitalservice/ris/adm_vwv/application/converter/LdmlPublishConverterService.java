package de.bund.digitalservice.ris.adm_vwv.application.converter;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.Fundstelle;
import de.bund.digitalservice.ris.adm_vwv.application.InstitutionType;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Normgeber;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.adapter.NodeToList;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
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
    return xmlWriter.writeXml(akomaNtoso);
  }

  private AkomaNtoso createAkomaNtoso(@Nonnull DocumentationUnitContent documentationUnitContent) {
    AkomaNtoso akomaNtoso;
    akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    Identification identification = new Identification();
    FrbrElement frbrExpression = new FrbrElement();
    FrbrAlias frbrAlias = new FrbrAlias();
    frbrAlias.setName("documentNumber");
    frbrAlias.setValue(documentationUnitContent.documentNumber());
    frbrExpression.setFrbrAlias(List.of(frbrAlias));
    identification.setFrbrExpression(frbrExpression);
    meta.setIdentification(identification);
    doc.setMeta(meta);
    doc.setPreface(new Preface());
    doc.setMainBody(new MainBody());
    return akomaNtoso;
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
    if (!zitierdaten.isEmpty()) {
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
    jaxbHtml.setHtml(List.of(langueberschrift));
  }

  private void setGliederung(Meta meta, String gliederung) {
    if (StringUtils.isNotBlank(gliederung)) {
      List<String> entries = Pattern.compile("<p>(.*?)</p>")
        .matcher(gliederung)
        .results()
        .map(matchResult -> matchResult.group(1))
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
    // As our editor do not offer any formatting, it is sufficient to replace <p> elements
    String kurzreferatWithAknNs = kurzreferat.replaceAll("<(/?)p>", "<$1akn:p>");
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
    if (!normgeberList.isEmpty()) {
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
    if (!keywords.isEmpty()) {
      Classification classification = new Classification();
      meta.setClassification(classification);
      classification.setKeyword(
        keywords
          .stream()
          .map(keywordValue -> {
            Keyword keyword = new Keyword();
            keyword.setShowAs(keywordValue);
            keyword.setValue(keywordValue);
            return keyword;
          })
          .toList()
      );
    }
  }

  private void setSachgebiete(Meta meta, List<FieldOfLaw> fieldsOfLaw) {
    if (!fieldsOfLaw.isEmpty()) {
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
    if (StringUtils.isNotBlank(dokumenttypZusatz)) {
      risDocumentType.setLongTitle(dokumenttypZusatz);
      value += " " + dokumenttypZusatz;
    }
    risDocumentType.setValue(value);
    meta.getOrCreateProprietary().getMetadata().setDocumentType(risDocumentType);
  }

  private void setAktenzeichen(Meta meta, List<String> aktenzeichen) {
    if (!aktenzeichen.isEmpty()) {
      RisMetadata risMetadata = meta.getOrCreateProprietary().getMetadata();
      risMetadata.setReferenceNumbers(aktenzeichen);
    }
  }

  private void setFundstellen(Meta meta, List<Fundstelle> fundstellen) {
    if (CollectionUtils.isNotEmpty(fundstellen)) {
      OtherReferences otherReferences = meta.getOrCreateAnalysis().getOtherReferences().getFirst();
      otherReferences.setImplicitReferences(
        fundstellen
          .stream()
          .map(fundstelle -> {
            ImplicitReference implicitReference = new ImplicitReference();
            implicitReference.setShortForm(fundstelle.periodikum().abbreviation());
            implicitReference.setShowAs(
              fundstelle.periodikum().abbreviation() + ", " + fundstelle.zitatstelle()
            );
            return implicitReference;
          })
          .toList()
      );
    }
  }
}

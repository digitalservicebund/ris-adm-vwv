package de.bund.digitalservice.ris.adm_vwv.application.converter;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnit;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.AkomaNtoso;
import de.bund.digitalservice.ris.adm_vwv.application.converter.transform.*;
import jakarta.annotation.Nonnull;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * LDML converter service for transforming XML/LDML into Business Models.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class LdmlConverterService {

  private final XmlReader xmlReader;
  private final FundstellenTransformer fundstellenTransformer;
  private final DocumentTypeTransformer documentTypeTransformer;
  private final NormgeberTransformer normgeberTransformer;
  private final FieldsOfLawTransformer fieldsOfLawTransformer;
  private final KurzreferatTransformer kurzreferatTransformer;

  /**
   * Converts the xml of the given documentation unit to business models.
   *
   * @param documentationUnit The documentation unit to convert
   * @return Business model representation of given documentation unit's xml
   */
  public DocumentationUnitContent convertToBusinessModel(
    @Nonnull DocumentationUnit documentationUnit
  ) {
    AkomaNtoso akomaNtoso = xmlReader.readXml(documentationUnit.xml());
    log.debug("Read Akoma Ntoso from XML: {}.", akomaNtoso);
    List<String> referenceNumbers = new ReferenceNumbersTransformer(akomaNtoso).transform();
    return new DocumentationUnitContent(
      documentationUnit.id(),
      documentationUnit.documentNumber(),
      fundstellenTransformer.transform(akomaNtoso),
      fieldsOfLawTransformer.transform(akomaNtoso),
      new LongTitleTransformer(akomaNtoso).transform(),
      new KeywordsTransformer(akomaNtoso).transform(),
      new DateToQuoteTransformer(akomaNtoso).transform(),
      new EntryIntoEffectDateTransformer(akomaNtoso).transform(),
      new ExpiryDateTransformer(akomaNtoso).transform(),
      new TableOfContentsTransformer().transform(akomaNtoso),
      kurzreferatTransformer.transform(akomaNtoso),
      referenceNumbers,
      referenceNumbers.isEmpty(),
      documentTypeTransformer.transform(akomaNtoso),
      new DocumentTypeZusatzTransformer(akomaNtoso).transform(),
      new ActiveCitationsTransformer(akomaNtoso).transform(),
      new ActiveReferencesTransformer(akomaNtoso).transform(),
      new NormReferencesTransformer(akomaNtoso).transform(),
      null,
      normgeberTransformer.transform(akomaNtoso),
      new BerufsbilderTransformer().transform(akomaNtoso),
      new TitelAspektTransformer().transform(akomaNtoso),
      new DefinitionsTransformer().transform(akomaNtoso)
    );
  }
}

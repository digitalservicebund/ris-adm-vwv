package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import java.util.List;
import java.util.UUID;

/**
 * Documentation unit content record.
 *
 * @param id The uuid
 * @param documentNumber The document number
 * @param references List of references ("Fundstellen")
 * @param fieldsOfLaw List of fields of law
 * @param langueberschrift Long title
 * @param keywords List of keywords
 * @param zitierdatum Date of quote
 * @param inkrafttretedatum Date of entry into effect
 * @param ausserkrafttretedatum Date of expiration
 * @param gliederung Table of contents
 * @param kurzreferat Preface
 * @param aktenzeichen List of reference numbers
 * @param noAktenzeichen {@code true} if no reference number is set, {@code false} otherwise
 * @param dokumenttyp The document type
 * @param dokumenttypZusatz Document type description
 * @param activeCitations List of active citations
 * @param activeReferences List of active references
 * @param normReferences List of norm references
 * @param note The note
 * @param normgeberList List of normgeber
 */
public record DocumentationUnitContent(
  UUID id,
  String documentNumber,
  List<Reference> references,
  List<FieldOfLaw> fieldsOfLaw,
  String langueberschrift,
  List<String> keywords,
  String zitierdatum,
  String inkrafttretedatum,
  String ausserkrafttretedatum,
  String gliederung,
  String kurzreferat,
  List<String> aktenzeichen,
  boolean noAktenzeichen,
  DocumentType dokumenttyp,
  String dokumenttypZusatz,
  List<ActiveCitation> activeCitations,
  List<ActiveReference> activeReferences,
  List<NormReference> normReferences,
  String note,
  List<Normgeber> normgeberList
) {}

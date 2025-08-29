package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.Fundstelle;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

/**
 * Documentation unit content record.
 *
 * @param id                    The uuid
 * @param documentNumber        The document number
 * @param fundstellen           List of fundstellen
 * @param fieldsOfLaw           List of fields of law
 * @param langueberschrift      Long title
 * @param keywords              List of keywords
 * @param zitierdaten           List of Date of quotes
 * @param inkrafttretedatum     Date of entry into effect
 * @param ausserkrafttretedatum Date of expiration
 * @param gliederung            Table of contents
 * @param kurzreferat           Preface
 * @param aktenzeichen          List of reference numbers
 * @param noAktenzeichen        {@code true} if no reference number is set,
 *                              {@code false} otherwise
 * @param dokumenttyp           The document type
 * @param dokumenttypZusatz     Document type description
 * @param activeCitations       List of active citations
 * @param activeReferences      List of active references
 * @param normReferences        List of norm references
 * @param note                  The note
 * @param normgeberList         List of normgeber
 * @param berufsbilder          List of berufsbild
 * @param titelAspekt           List of titelAspekt
 * @param definitions           List of definition
 */
public record DocumentationUnitContent(
  UUID id,
  String documentNumber,
  List<Fundstelle> fundstellen,
  List<FieldOfLaw> fieldsOfLaw,
  @NotBlank String langueberschrift,
  List<String> keywords,
  @NotEmpty List<String> zitierdaten,
  @NotBlank String inkrafttretedatum,
  String ausserkrafttretedatum,
  String gliederung,
  String kurzreferat,
  List<String> aktenzeichen,
  boolean noAktenzeichen,
  @NotNull DocumentType dokumenttyp,
  String dokumenttypZusatz,
  List<ActiveCitation> activeCitations,
  List<ActiveReference> activeReferences,
  List<NormReference> normReferences,
  String note,
  @NotEmpty List<Normgeber> normgeberList,
  List<String> berufsbilder,
  List<String> titelAspekt,
  List<Definition> definitions
) {}

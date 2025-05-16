package de.bund.digitalservice.ris.adm_vwv.application;

import java.util.List;

/**
 * Fundstelle business object
 *
 * @param id          The id of the Fundstelle
 * @param zitatstelle The Zitatstelle of the Fundstelle
 * @param periodika   The list of Periodika of this Fundstelle
 */
public record Fundstelle(String id, String zitatstelle, List<Periodikum> periodika) {}

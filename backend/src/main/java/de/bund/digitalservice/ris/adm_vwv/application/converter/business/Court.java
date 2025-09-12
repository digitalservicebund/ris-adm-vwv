package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import java.util.UUID;

/**
 * Court record.
 *
 * @param id The uuid
 * @param type The type
 * @param location The location
 */
public record Court(UUID id, String type, String location) {}

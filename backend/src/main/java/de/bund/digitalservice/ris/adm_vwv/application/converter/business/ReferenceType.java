package de.bund.digitalservice.ris.adm_vwv.application.converter.business;

import jakarta.annotation.Nonnull;
import java.util.UUID;

/**
 * ReferenceType business object
 *
 * @param id The uuid
 * @param name The name of the reference type (e.g. "rechtsgrundlage")
 */
public record ReferenceType(@Nonnull UUID id, @Nonnull String name) {}

package de.bund.digitalservice.ris.adm_vwv.application;

import lombok.Builder;

@Builder
public record Norm(String abbreviation, String singleNormDescription) {}

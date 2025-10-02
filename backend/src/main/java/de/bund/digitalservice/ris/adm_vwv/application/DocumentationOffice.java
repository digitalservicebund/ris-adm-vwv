package de.bund.digitalservice.ris.adm_vwv.application;

import lombok.Getter;

/**
 * Represents the documentation offices,
 * each with a unique prefix for identification.
 */
@Getter
public enum DocumentationOffice {
  BAG("KA"),
  BFH("ST"),
  BSG("KS"),
  BVERFG("KV"),
  BVERWG("WB");

  public final String prefix;

  DocumentationOffice(String prefix) {
    this.prefix = prefix;
  }
}

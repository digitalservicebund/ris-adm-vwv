package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import java.text.DecimalFormat;
import java.time.Year;

/**
 * Represents a document number series to generate the next number in the sequence.
 *
 * @param prefix The office-specific prefix (e.g., KALU, STLU).
 * @param year The current year.
 * @param latestNumber The last persisted number for this series, or null if none exists (6-digits).
 */
public record DocumentNumber(String prefix, Year year, String latestNumber) {
  private static final DecimalFormat DECIMAL_FORMAT = new DecimalFormat("000000");
  private static final String VALID_DOCUMENT_NUMBER_PATTERN = "[A-Z]{4}\\d{10}";

  /**
   * Creates the next document number in the series.
   *
   * @return The newly generated document number string.
   * @throws IllegalArgumentException if the latestNumber does not match the expected prefix and year.
   */
  public String create() {
    String fullPrefix = prefix() + year().getValue();
    int number = 0;

    if (latestNumber() != null) {
      if (!latestNumber().startsWith(fullPrefix)) {
        throw new IllegalArgumentException(
          "Invalid last document number: " + latestNumber() + " does not match prefix " + fullPrefix
        );
      }
      if (!latestNumber().matches(VALID_DOCUMENT_NUMBER_PATTERN)) {
        throw new IllegalArgumentException("Invalid last document number: " + latestNumber());
      }
      number = Integer.parseInt(latestNumber().substring(fullPrefix.length()));
    }

    return fullPrefix + DECIMAL_FORMAT.format(++number);
  }
}

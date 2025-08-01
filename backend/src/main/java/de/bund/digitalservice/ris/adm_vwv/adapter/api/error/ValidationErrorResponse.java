package de.bund.digitalservice.ris.adm_vwv.adapter.api.error;

import java.util.List;
import org.springframework.http.HttpStatus;

/**
 * Validation error response record used as response on validation exceptions.
 *
 * @param status The http status
 * @param message
 * @param fieldErrors
 * @param globalErrors
 */
public record ValidationErrorResponse(
  HttpStatus status,
  String message,
  List<String> fieldErrors,
  List<String> globalErrors
) {}

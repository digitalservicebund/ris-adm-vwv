package de.bund.digitalservice.ris.adm_vwv.application;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

/**
 * Exception for internal validation failures.
 * <p>
 * Results in an HTTP 500 (Internal Server Error) response.
 */
public class ValidationFailedException extends ErrorResponseException {

  public ValidationFailedException(String message, Throwable cause) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR, message),
      cause
    );
  }
}

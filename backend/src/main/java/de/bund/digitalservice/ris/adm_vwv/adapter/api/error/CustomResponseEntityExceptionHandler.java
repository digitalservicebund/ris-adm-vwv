package de.bund.digitalservice.ris.adm_vwv.adapter.api.error;

import jakarta.annotation.Nonnull;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/**
 * Custom response entity exception handler. As extension to the Spring MVC default implementation,
 * it defines a fallback for any exception that can occur. Furthermore, validation errors are returned
 * as structured JSON response.
 */
@ControllerAdvice
@Slf4j
public class CustomResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {

  @Override
  protected ResponseEntity<Object> handleMethodArgumentNotValid(
    MethodArgumentNotValidException exception,
    @Nonnull HttpHeaders headers,
    @Nonnull HttpStatusCode status,
    @Nonnull WebRequest request
  ) {
    List<String> fieldErrors = exception
      .getBindingResult()
      .getFieldErrors()
      .stream()
      .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage())
      .toList();
    List<String> globalErrors = exception
      .getBindingResult()
      .getGlobalErrors()
      .stream()
      .map(globalError -> globalError.getObjectName() + ": " + globalError.getDefaultMessage())
      .toList();
    ValidationErrorResponse validationErrorResponse = new ValidationErrorResponse(
      HttpStatus.BAD_REQUEST,
      "Validation error.",
      fieldErrors,
      globalErrors
    );
    return handleExceptionInternal(
      exception,
      validationErrorResponse,
      headers,
      validationErrorResponse.status(),
      request
    );
  }

  /**
   * Exception handler fallback for exceptions not explicitly handled by this class.
   * @param exception The exception
   * @param request The request object
   * @return Response entity with problem detail body
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<Object> handleAllExceptions(Exception exception, WebRequest request) {
    ProblemDetail problemDetail = createProblemDetail(
      exception,
      HttpStatus.INTERNAL_SERVER_ERROR,
      exception.getMessage(),
      null,
      null,
      request
    );
    log
      .atError()
      .setMessage("An error occurred while processing the request on {}.")
      .addArgument(request.getDescription(false))
      .setCause(exception)
      .log();
    return handleExceptionInternal(
      exception,
      problemDetail,
      HttpHeaders.EMPTY,
      HttpStatus.INTERNAL_SERVER_ERROR,
      request
    );
  }
}

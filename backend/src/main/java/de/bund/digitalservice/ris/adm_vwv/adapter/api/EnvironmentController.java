package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for environment-related information that the frontend can use
 * to configure itself at runtime. Since this is a technical endpoint similar
 * to /actuator and not related to our domain, it is not prefixed with /api.
 */
@RestController
@RequestMapping("environment")
public class EnvironmentController {

  @Value("${frontend.auth.clientId}")
  private String frontendAuthClientId;

  @Value("${frontend.auth.realm}")
  private String frontendAuthRealm;

  @Value("${frontend.auth.url}")
  private String frontendAuthUrl;

  /**
   * Returns information and configuration details for the current environment.
   *
   * @return A {@link ResponseEntity} containing the environment details.
   */
  @GetMapping(produces = { APPLICATION_JSON_VALUE })
  public ResponseEntity<EnvironmentResponse> getEnvironment() {
    var info = new EnvironmentResponse(frontendAuthClientId, frontendAuthUrl, frontendAuthRealm);

    return ResponseEntity.ok(info);
  }
}

package de.bund.digitalservice.ris.adm_vwv.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeCode;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationOffice;
import de.bund.digitalservice.ris.adm_vwv.config.security.CustomJwtAuthenticationConverter;
import de.bund.digitalservice.ris.adm_vwv.config.security.UserDocumentDetails;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

class SecurityConfigurationTest {

  private Converter<Jwt, AbstractAuthenticationToken> authenticationConverter;

  @BeforeEach
  void setUp() {
    authenticationConverter = new CustomJwtAuthenticationConverter();
  }

  @Test
  void shouldConvertJwtToTokenWithCorrectPrincipalAndAuthorities() {
    final Map<String, Object> realmAccess = Map.of("roles", List.of("adm_user", "another_role"));
    final Jwt jwt = createMockJwt(Map.of("realm_access", realmAccess));

    // when
    AbstractAuthenticationToken token = authenticationConverter.convert(jwt);

    // then
    assertThat(token).isNotNull();

    assertThat(token.getAuthorities())
      .hasSize(2)
      .containsExactlyInAnyOrder(
        new SimpleGrantedAuthority("ROLE_adm_user"),
        new SimpleGrantedAuthority("ROLE_another_role")
      );

    assertThat(token.getPrincipal()).isInstanceOf(UserDocumentDetails.class);

    UserDocumentDetails details = (UserDocumentDetails) token.getPrincipal();
    assertThat(details.office()).isEqualTo(DocumentationOffice.BSG);
    assertThat(details.type()).isEqualTo(DocumentTypeCode.ADMINISTRATIVE);
  }

  @Test
  void shouldThrowExceptionWhenNoValidApplicationRoleIsFound() {
    // given
    final Map<String, Object> realmAccess = Map.of("roles", List.of("some_other_role", "guest"));
    final Jwt jwt = createMockJwt(Map.of("realm_access", realmAccess));

    // when / then
    assertThatThrownBy(() -> authenticationConverter.convert(jwt))
      .isInstanceOf(IllegalStateException.class)
      .hasMessage("User does not have a required application role.");
  }

  @Test
  void shouldThrowExceptionWhenRolesListIsEmpty() {
    // given
    final Map<String, Object> realmAccess = Map.of("roles", List.of());
    final Jwt jwt = createMockJwt(Map.of("realm_access", realmAccess));

    // when / then
    assertThatThrownBy(() -> authenticationConverter.convert(jwt))
      .isInstanceOf(IllegalStateException.class)
      .hasMessage("User does not have a required application role.");
  }

  /**
   * Helper method to create a mock JWT with specific claims.
   */
  private Jwt createMockJwt(Map<String, Object> customClaims) {
    Map<String, Object> claims = new HashMap<>();
    claims.put("sub", "test-subject");
    claims.putAll(customClaims);

    return new Jwt(
      "mock-token",
      Instant.now(),
      Instant.now().plusSeconds(60),
      Map.of("alg", "none"),
      claims
    );
  }
}

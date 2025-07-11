package de.bund.digitalservice.ris.adm_vwv.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;

class SecurityConfigurationTest {

  private JwtAuthenticationConverter jwtAuthenticationConverter;

  @BeforeEach
  void setUp() {
    SecurityConfiguration securityConfiguration = new SecurityConfiguration();
    jwtAuthenticationConverter = securityConfiguration.jwtAuthenticationConverterForKeycloak();
  }

  @Test
  void shouldConvertRolesCorrectly() {
    // given
    final Map<String, Object> realmAccess = Map.of("roles", List.of("vwv_user", "another_role"));
    final Jwt jwt = createMockJwt(Map.of("realm_access", realmAccess));

    // when
    AbstractAuthenticationToken token = jwtAuthenticationConverter.convert(jwt);

    // then
    assertThat(token).isNotNull();
    assertThat(token.getAuthorities())
      .hasSize(2)
      .containsExactlyInAnyOrder(
        new SimpleGrantedAuthority("ROLE_vwv_user"),
        new SimpleGrantedAuthority("ROLE_another_role")
      );
  }

  @Test
  void shouldReturnEmptyListWhenRolesListIsEmpty() {
    // given
    final Map<String, Object> realmAccess = Map.of("roles", List.of());
    final Jwt jwt = createMockJwt(Map.of("realm_access", realmAccess));

    // when
    AbstractAuthenticationToken token = jwtAuthenticationConverter.convert(jwt);

    // then
    assertThat(token).isNotNull();
    assertThat(token.getAuthorities()).isEmpty();
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

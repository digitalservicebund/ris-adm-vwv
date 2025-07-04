package de.bund.digitalservice.ris.adm_vwv.config;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security Configuration
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfiguration {

  /**
   * Configures the CORS policy for the application.
   *
   * @return The configured {@link CorsConfigurationSource} for Spring Security.
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:8080"));
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

  /**
   * Configures security settings for specific HTTP requests.
   *
   * @param http The {@link HttpSecurity} object to configure security settings.
   * @return A {@link SecurityFilterChain} configured with security settings.
   * @throws Exception If an exception occurs during security configuration.
   */
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(authorize ->
        authorize
          // --- PUBLIC ENDPOINTS ---
          .requestMatchers(
            "/.well-known/security.txt",
            "/actuator/health/**",
            "/actuator/prometheus"
          )
          .permitAll()
          // --- SECURED ENDPOINTS ---
          .requestMatchers("/api/**") // Secure all API paths
          .hasRole("vwv_user")
          // .hasRole("VWN_ROLE") // Require the single role
          // --- DENY ALL OTHERS ---
          .anyRequest()
          .denyAll()
      )
      .exceptionHandling(configurer ->
        configurer.defaultAuthenticationEntryPointFor(
          new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
          PathPatternRequestMatcher.withDefaults().matcher("/api/**")
        )
      )
      .oauth2ResourceServer(oauth2 ->
        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverterForKeycloak()))
      )
      .csrf(AbstractHttpConfigurer::disable)
      .cors(Customizer.withDefaults())
      .sessionManagement(sessionManagement ->
        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      );
    return http.build();
  }

  /**
   * A custom {@link JwtAuthenticationConverter} that extracts user roles from the Keycloak JWT.
   * <p>
   * By default, Keycloak includes user roles inside the "roles" array within the "realm_access" claim.
   * This converter retrieves those roles and transforms them into a list of {@link SimpleGrantedAuthority}
   * instances, prefixing each role with "ROLE_" to comply with Spring Security's expectations when using
   * the {@code .hasRole()} method.
   * </p>
   * <p>
   * The method suppresses unchecked warnings because Keycloak consistently provides the "realm_access" claim
   * as a {@code Map<String, Object>} containing a {@code List<String>} for roles. Since the format is well-defined
   * and predictable in Keycloak, the unchecked cast is safe in this specific context.
   * </p>
   *
   * @return a configured instance of {@link JwtAuthenticationConverter} that maps Keycloak roles to Spring Security authorities
   */
  @Bean
  @SuppressWarnings("unchecked")
  public JwtAuthenticationConverter jwtAuthenticationConverterForKeycloak() {
    final Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter = jwt -> {
      final Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
      if (realmAccess == null || realmAccess.isEmpty()) {
        return List.of();
      }
      final List<String> roles = (List<String>) realmAccess.get("roles");
      if (roles == null || roles.isEmpty()) {
        return List.of();
      }
      return roles
        .stream()
        .map(role -> "ROLE_" + role) // add prefix needed for .hasRole()
        .map(SimpleGrantedAuthority::new)
        .collect(Collectors.toList());
    };
    var jwtAuthenticationConverter = new JwtAuthenticationConverter();
    jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
    return jwtAuthenticationConverter;
  }
}

package de.bund.digitalservice.ris.adm_vwv.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

/**
 * Security Configuration
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

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
          .requestMatchers("/actuator/**", "/api/swagger-ui/**", "/environment")
          .permitAll()
          // --- SECURED ENDPOINTS ---
          .requestMatchers("/api/**")
          // TODO: Remove adm_vwv_user once role flow is implemented //NOSONAR
          .hasAnyRole("adm_user", "adm_vwv_user", "literature_user")
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
        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(customJwtAuthenticationConverter()))
      )
      .csrf(AbstractHttpConfigurer::disable)
      .sessionManagement(sessionManagement ->
        sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      )
      .headers(httpSecurityHeadersConfigurer ->
        httpSecurityHeadersConfigurer
          .contentSecurityPolicy(contentSecurityPolicyConfig ->
            contentSecurityPolicyConfig.policyDirectives(
              "default-src 'self'; " +
              "img-src 'self' data:; " +
              "style-src 'self' 'unsafe-inline'; " +
              "script-src 'self' 'unsafe-eval'; " +
              "connect-src 'self' https://neuris.login.bare.id *.sentry.io data:; " +
              "report-uri https://o1248831.ingest.us.sentry.io/api/4508482613084160/security/?sentry_key=7c56d29d5dd2c9bd48fc72a8edaffe57;"
            )
          )
          .contentTypeOptions(_ -> {})
          .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
          .referrerPolicy(referrerPolicyConfig ->
            referrerPolicyConfig.policy(
              ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN
            )
          )
          .permissionsPolicyHeader(permissionsPolicyConfig ->
            permissionsPolicyConfig.policy(
              "accelerometer=(), ambient-light-sensor=(), autoplay=(), battery=(), camera=(), cross-origin-isolated=(), " +
              "display-capture=(), document-domain=(), encrypted-media=(), execution-while-not-rendered=(), " +
              "execution-while-out-of-viewport=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), " +
              "magnetometer=(), microphone=(), midi=(), navigation-override=(), payment=(), picture-in-picture=(), " +
              "publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=(), " +
              "clipboard-read=(self), clipboard-write=(self), gamepad=(), speaker-selection=(), conversion-measurement=(), " +
              "focus-without-user-activation=(self), hid=(), idle-detection=(), interest-cohort=(), serial=(), sync-script=(), " +
              "trust-token-redemption=(), window-placement=(), vertical-scroll=(self)"
            )
          )
      );

    return http.build();
  }

  /**
   * Creates a custom converter that transforms a JWT into an AbstractAuthenticationToken
   * with a UserDocumentDetails principal. This centralizes user context creation.
   *
   * @return The configured Converter instance.
   */
  @Bean
  public Converter<Jwt, AbstractAuthenticationToken> customJwtAuthenticationConverter() {
    return new CustomJwtAuthenticationConverter();
  }
}

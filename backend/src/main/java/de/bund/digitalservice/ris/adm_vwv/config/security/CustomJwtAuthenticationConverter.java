package de.bund.digitalservice.ris.adm_vwv.config.security;

import de.bund.digitalservice.ris.adm_vwv.application.ApplicationRole;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeCode;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationOffice;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.CollectionUtils;

/**
 * Converts a JWT into a UserDetailsAuthenticationToken, extracting user roles
 * and creating a UserDocumentDetails principal.
 */
@Slf4j
public class CustomJwtAuthenticationConverter
  implements Converter<Jwt, AbstractAuthenticationToken> {

  @Override
  @SuppressWarnings("unchecked")
  public AbstractAuthenticationToken convert(@NonNull Jwt jwt) {
    Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
    List<String> userRoles = (List<String>) realmAccess.getOrDefault(
      "roles",
      Collections.emptyList()
    );

    Collection<GrantedAuthority> authorities = userRoles
      .stream()
      .map(role -> "ROLE_" + role)
      .map(SimpleGrantedAuthority::new)
      .collect(Collectors.toList());

    if (CollectionUtils.isEmpty(userRoles)) {
      log.error("User '{}' has no roles in the 'realm_access' claim.", jwt.getSubject());
      throw new IllegalStateException("User does not have a required application role.");
    }

    ApplicationRole applicationRole = null;

    // Find the first user role that is a valid ApplicationRole - we assume no multi-role
    for (String roleName : userRoles) {
      try {
        applicationRole = ApplicationRole.from(roleName);
        break;
      } catch (IllegalArgumentException _) {
        // This role is not a valid ApplicationRole, continue to the next one.
      }
    }

    // If no valid role was found after checking all of them, throw an error.
    if (applicationRole == null) {
      log.error(
        "User '{}' does not have a required application role. Found roles: {}",
        jwt.getSubject(),
        userRoles
      );
      throw new IllegalStateException("User does not have a required application role.");
    }

    DocumentTypeCode type = applicationRole.getDocumentTypeCode();
    DocumentationOffice office = applicationRole.getDocumentationOffice(jwt);

    var userDetails = new UserDocumentDetails(office, type);

    return new UserDetailsAuthenticationToken(userDetails, jwt, authorities);
  }
}

package de.bund.digitalservice.ris.adm_vwv.config.security;

import java.util.Collection;
import lombok.EqualsAndHashCode;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

/**
 * A custom authentication token that holds UserDocumentDetails as its principal.
 */
@EqualsAndHashCode(callSuper = true)
public class UserDetailsAuthenticationToken extends AbstractAuthenticationToken {

  private final Jwt jwt;
  private final UserDocumentDetails userDetails;

  public UserDetailsAuthenticationToken(
    UserDocumentDetails userDetails,
    Jwt jwt,
    Collection<? extends GrantedAuthority> authorities
  ) {
    super(authorities);
    this.jwt = jwt;
    this.userDetails = userDetails;
    setAuthenticated(true);
  }

  @Override
  public Object getCredentials() {
    return this.jwt.getTokenValue();
  }

  @Override
  public Object getPrincipal() {
    return this.userDetails;
  }
}

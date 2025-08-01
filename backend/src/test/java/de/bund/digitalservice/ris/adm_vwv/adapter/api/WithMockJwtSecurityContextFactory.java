package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockJwtSecurityContextFactory implements WithSecurityContextFactory<WithMockJwt> {

  @Override
  public SecurityContext createSecurityContext(WithMockJwt annotation) {
    Jwt jwt = Jwt.withTokenValue("token")
      .header("alg", "none")
      .claim("sub", annotation.value())
      .build();
    var token = new JwtAuthenticationToken(
      jwt,
      AuthorityUtils.createAuthorityList(annotation.roles())
    );
    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(token);
    return context;
  }
}

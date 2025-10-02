package de.bund.digitalservice.ris.adm_vwv.test;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeCode;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentationOffice;
import de.bund.digitalservice.ris.adm_vwv.config.security.UserDocumentDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

public class WithMockAdmUserSecurityContextFactory
  implements WithSecurityContextFactory<WithMockAdmUser> {

  @Override
  public SecurityContext createSecurityContext(WithMockAdmUser annotation) {
    SecurityContext context = SecurityContextHolder.createEmptyContext();

    var principal = new UserDocumentDetails(
      DocumentationOffice.BSG,
      DocumentTypeCode.ADMINISTRATIVE
    );

    var auth = new UsernamePasswordAuthenticationToken(principal, "password");

    context.setAuthentication(auth);
    return context;
  }
}

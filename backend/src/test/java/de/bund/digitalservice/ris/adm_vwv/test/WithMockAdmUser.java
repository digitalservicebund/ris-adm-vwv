package de.bund.digitalservice.ris.adm_vwv.test;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import org.springframework.security.test.context.support.WithSecurityContext;

@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = WithMockAdmUserSecurityContextFactory.class)
public @interface WithMockAdmUser {
}

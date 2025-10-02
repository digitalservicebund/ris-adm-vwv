package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import java.lang.annotation.*;
import org.springframework.security.test.context.support.WithSecurityContext;

@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@WithSecurityContext(factory = WithMockJwtSecurityContextFactory.class)
public @interface WithMockJwt {
  String value() default "6efd8630-721e-47a7-856e-8b89723dc9d4";

  String[] roles() default { "ROLE_adm_user" };
}

package de.bund.digitalservice.ris.adm_vwv.config;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootTest
@AutoConfigureMockMvc
@Import(SecurityConfigurationIntegrationTest.TestController.class)
class SecurityConfigurationIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @RestController
  static class TestController {

    @GetMapping("/api/test")
    public String getSecuredResource() {
      return "secured";
    }

    @GetMapping("/some/other/path")
    public String getOtherResource() {
      return "other";
    }
  }

  // --- PUBLIC ENDPOINTS ---

  @Test
  void whenRequestingPublicActuatorEndpoint_thenOk() throws Exception {
    mockMvc.perform(get("/actuator/health")).andExpect(status().isOk());
  }

  @Test
  void whenRequestingSwaggerDocs_thenOk() throws Exception {
    mockMvc.perform(get("/api/swagger-ui/index.html")).andExpect(status().isOk());
  }

  // --- SECURED ENDPOINTS ---

  @Test
  void whenRequestingSecuredApiEndpointWithoutAuth_thenUnauthorized() throws Exception {
    mockMvc.perform(get("/api/test")).andExpect(status().isUnauthorized());
  }

  @Test
  void whenRequestingSecuredApiEndpointWithAuthButWrongRole_thenForbidden() throws Exception {
    mockMvc
      .perform(
        get("/api/test").with(jwt().authorities(new SimpleGrantedAuthority("ROLE_wrong_role")))
      )
      .andExpect(status().isForbidden());
  }

  @Test
  void whenRequestingSecuredApiEndpointWithCorrectRole_thenOk() throws Exception {
    mockMvc
      .perform(
        get("/api/test").with(jwt().authorities(new SimpleGrantedAuthority("ROLE_adm_user")))
      )
      .andExpect(status().isOk());
  }

  // --- DENY ALL OTHERS ---

  @Test
  void whenRequestingUndefinedEndpoint_thenForbidden() throws Exception {
    mockMvc
      .perform(
        get("/some/other/path").with(jwt().authorities(new SimpleGrantedAuthority("ROLE_adm_user")))
      )
      .andExpect(status().isForbidden());
  }
}

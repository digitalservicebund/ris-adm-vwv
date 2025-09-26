package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.ReferenceType;
import de.bund.digitalservice.ris.adm_vwv.config.SecurityConfiguration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = ReferenceTypeController.class)
@Import(SecurityConfiguration.class)
@WithMockUser(roles = "adm_vwv_user")
class ReferenceTypeControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with three reference types")
  void getReferenceTypes() throws Exception {
    // given
    var anwendung = new ReferenceType(UUID.randomUUID(), "anwendung");
    var neuregelung = new ReferenceType(UUID.randomUUID(), "neuregelung");
    var rechtsgrundlage = new ReferenceType(UUID.randomUUID(), "rechtsgrundlage");
    given(
      lookupTablesPort.findReferenceTypes(
        new ReferenceTypeQuery("", new QueryOptions(0, 3, "name", Sort.Direction.ASC, true))
      )
    ).willReturn(TestPage.create(List.of(anwendung, neuregelung, rechtsgrundlage)));

    // when
    mockMvc
      .perform(
        get("/api/lookup-tables/reference-types").param("searchTerm", "").param("pageSize", "3")
      )
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.referenceTypes[0].name").value(anwendung.name()))
      .andExpect(jsonPath("$.referenceTypes[1].name").value(neuregelung.name()))
      .andExpect(jsonPath("$.referenceTypes[2].name").value(rechtsgrundlage.name()));
  }
}

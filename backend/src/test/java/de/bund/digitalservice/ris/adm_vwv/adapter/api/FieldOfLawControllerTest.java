package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import de.bund.digitalservice.ris.adm_vwv.config.SecurityConfiguration;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = FieldOfLawController.class)
@Import(SecurityConfiguration.class)
class FieldOfLawControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with one field of law child")
  void getFieldsOfLaw() throws Exception {
    // given
    given(lookupTablesPort.findFieldsOfLawChildren("AR-01")).willReturn(
      List.of(
        new FieldOfLaw(
          UUID.randomUUID(),
          false,
          "AR-01-05",
          "Arbeitsrecht speziell",
          List.of(),
          List.of(),
          List.of(),
          null
        )
      )
    );

    // when
    mockMvc
      .perform(get("/api/lookup-tables/fields-of-law/{identifier}/children", "AR-01"))
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.fieldsOfLaw[0].identifier").value("AR-01-05"))
      .andExpect(jsonPath("$.fieldsOfLaw[0].text").value("Arbeitsrecht speziell"));
  }

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with one field of law root (parent)")
  void getFieldsOfLawParents() throws Exception {
    // given
    given(lookupTablesPort.findFieldsOfLawParents()).willReturn(
      List.of(
        new FieldOfLaw(
          UUID.randomUUID(),
          false,
          "AR",
          "Arbeitsrecht",
          List.of(),
          List.of(),
          List.of(),
          null
        )
      )
    );

    // when
    mockMvc
      .perform(get("/api/lookup-tables/fields-of-law/root/children"))
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.fieldsOfLaw[0].identifier").value("AR"))
      .andExpect(jsonPath("$.fieldsOfLaw[0].text").value("Arbeitsrecht"));
  }
}

package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
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

@WebMvcTest(controllers = RegionController.class)
@Import(SecurityConfiguration.class)
@WithMockUser(roles = "vwv_user")
class RegionControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with two regions with code and long text")
  void getDocumentTypes() throws Exception {
    // given
    given(
      lookupTablesPort.findRegions(
        new RegionQuery(null, new QueryOptions(0, 2, "code", Sort.Direction.ASC, true))
      )
    ).willReturn(
      TestPage.create(
        List.of(
          new Region(UUID.randomUUID(), "AA", null),
          new Region(UUID.randomUUID(), "BB", null)
        )
      )
    );

    // when
    mockMvc
      .perform(get("/api/lookup-tables/regions").param("pageSize", "2"))
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.regions[0].code").value("AA"))
      .andExpect(jsonPath("$.regions[1].code").value("BB"));
  }
}

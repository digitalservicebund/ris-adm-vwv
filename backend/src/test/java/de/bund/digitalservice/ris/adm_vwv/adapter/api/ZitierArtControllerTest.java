package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.config.security.SecurityConfiguration;
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

@WebMvcTest(controllers = ZitierArtController.class)
@Import(SecurityConfiguration.class)
@WithMockUser(roles = "adm_vwv_user")
class ZitierArtControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with four 'Zitierarten'")
  void getZitierArten() throws Exception {
    // given
    var abgrenzung = new ZitierArt(UUID.randomUUID(), "Abgrenzung", "Abgrenzung");
    var ablehnung = new ZitierArt(UUID.randomUUID(), "Ablehunng", "Ablehunng");
    var aenderung = new ZitierArt(UUID.randomUUID(), "Änderung", "Änderung");
    var uebernahme = new ZitierArt(UUID.randomUUID(), "Übernahme", "Übernahme");
    given(
      lookupTablesPort.findZitierArten(
        new ZitierArtQuery("", new QueryOptions(0, 4, "abbreviation", Sort.Direction.ASC, true))
      )
    ).willReturn(TestPage.create(List.of(abgrenzung, ablehnung, aenderung, uebernahme)));

    // when
    mockMvc
      .perform(
        get("/api/lookup-tables/zitier-arten").param("searchTerm", "").param("pageSize", "4")
      )
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.zitierArten[0].abbreviation").value(abgrenzung.abbreviation()))
      .andExpect(jsonPath("$.zitierArten[1].abbreviation").value(ablehnung.abbreviation()))
      .andExpect(jsonPath("$.zitierArten[2].abbreviation").value(aenderung.abbreviation()))
      .andExpect(jsonPath("$.zitierArten[3].abbreviation").value(uebernahme.abbreviation()));
  }
}

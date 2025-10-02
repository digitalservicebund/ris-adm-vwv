package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.NormAbbreviation;
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

@WebMvcTest(controllers = NormAbbreviationController.class)
@Import(SecurityConfiguration.class)
@WithMockUser(roles = "adm_user")
class NormAbbreviationControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName(
    "GET returns HTTP 200 and a JSON with two norm abbreviations with abbr and long title"
  )
  void getNormAbbreviations() throws Exception {
    // given
    var normAbbr1 = new NormAbbreviation(
      UUID.randomUUID(),
      "SGB 5",
      "Sozialgesetzbuch (SGB) Fünftes Buch (V)"
    );
    var normAbbr2 = new NormAbbreviation(
      UUID.randomUUID(),
      "KVLG",
      "Gesetz zur Weiterentwicklung des Rechts der gesetzlichen Krankenversicherung"
    );
    given(
      lookupTablesPort.findNormAbbreviations(
        new NormAbbreviationQuery(
          "",
          new QueryOptions(0, 2, "abbreviation", Sort.Direction.ASC, true)
        )
      )
    ).willReturn(TestPage.create(List.of(normAbbr1, normAbbr2)));

    // when
    mockMvc
      .perform(
        get("/api/lookup-tables/norm-abbreviations").param("searchTerm", "").param("pageSize", "2")
      )
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.normAbbreviations[0].abbreviation").value(normAbbr1.abbreviation()))
      .andExpect(
        jsonPath("$.normAbbreviations[0].officialLongTitle").value(normAbbr1.officialLongTitle())
      )
      .andExpect(jsonPath("$.normAbbreviations[1].abbreviation").value(normAbbr2.abbreviation()))
      .andExpect(
        jsonPath("$.normAbbreviations[1].officialLongTitle").value(normAbbr2.officialLongTitle())
      );
  }
}

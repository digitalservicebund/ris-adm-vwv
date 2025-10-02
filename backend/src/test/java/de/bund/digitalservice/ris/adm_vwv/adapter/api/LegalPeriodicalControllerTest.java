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

@WebMvcTest(controllers = LegalPeriodicalController.class)
@Import(SecurityConfiguration.class)
@WithMockUser(roles = "adm_user")
class LegalPeriodicalControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName(
    "GET returns HTTP 200 and a JSON with two legalPeriodicals with abbreviation, title, subtitle and citationStyle"
  )
  void getLegalPeriodicals() throws Exception {
    // given
    var lp1Abbreviation = "AA";
    var lp1Title = "Arbeitsrecht aktiv";
    var lp1Subtitle = "Arbeitsrecht optimal gestalten und erfolgreich anwenden";
    var lp1CitationStyle = "2009, 55-59; AA &amp;, 2015, 6-13 (Sonderausgabe)";
    var lp1 = new LegalPeriodical(
      UUID.randomUUID(),
      lp1Abbreviation,
      "aa",
      lp1Title,
      lp1Subtitle,
      lp1CitationStyle
    );
    var lp2Abbreviation = "BKK";
    var lp2Title = "Die Betriebskrankenkasse";
    var lp2Subtitle = "Zeitschrift des Bundesverbandes der Betriebskrankenkassen Essen";
    var lp2CitationStyle = "1969, 138-140; BKK 2007, Sonderbeilage, 1-5";
    var lp2 = new LegalPeriodical(
      UUID.randomUUID(),
      lp2Abbreviation,
      "bkk",
      lp2Title,
      lp2Subtitle,
      lp2CitationStyle
    );
    String searchTerm = "a";
    given(
      lookupTablesPort.findLegalPeriodicals(
        new LegalPeriodicalQuery(
          searchTerm,
          new QueryOptions(0, 2, "abbreviation", Sort.Direction.ASC, true)
        )
      )
    ).willReturn(TestPage.create(List.of(lp1, lp2)));

    // when
    mockMvc
      .perform(
        get("/api/lookup-tables/legal-periodicals")
          .param("searchTerm", searchTerm)
          .param("pageSize", "2")
      )
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.legalPeriodicals[0].abbreviation").value(lp1Abbreviation))
      .andExpect(jsonPath("$.legalPeriodicals[0].title").value(lp1Title))
      .andExpect(jsonPath("$.legalPeriodicals[0].subtitle").value(lp1Subtitle))
      .andExpect(jsonPath("$.legalPeriodicals[0].citationStyle").value(lp1CitationStyle))
      .andExpect(jsonPath("$.legalPeriodicals[1].abbreviation").value(lp2Abbreviation))
      .andExpect(jsonPath("$.legalPeriodicals[1].title").value(lp2Title))
      .andExpect(jsonPath("$.legalPeriodicals[1].subtitle").value(lp2Subtitle))
      .andExpect(jsonPath("$.legalPeriodicals[1].citationStyle").value(lp2CitationStyle));
  }
}

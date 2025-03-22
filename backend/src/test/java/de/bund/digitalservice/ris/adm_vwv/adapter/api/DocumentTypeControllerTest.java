package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentType;
import de.bund.digitalservice.ris.adm_vwv.application.DocumentTypeQuery;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPort;
import de.bund.digitalservice.ris.adm_vwv.application.PageQuery;
import de.bund.digitalservice.ris.adm_vwv.config.SecurityConfiguration;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = DocumentTypeController.class)
@Import(SecurityConfiguration.class)
class DocumentTypeControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private LookupTablesPort lookupTablesPort;

  @Test
  @DisplayName("GET returns HTTP 200 and a JSON with two documentTypes with abbreviation and name")
  void getDocumentTypes() throws Exception {
    // given
    String searchQuery = "verwaltungs";
    given(
      lookupTablesPort.findDocumentTypes(
        new DocumentTypeQuery(searchQuery, new PageQuery(0, 2, "name", Sort.Direction.ASC, true))
      )
    ).willReturn(
      new PageImpl<>(
        List.of(
          new DocumentType("VE", "Verwaltungsvereinbarung"),
          new DocumentType("VR", "Verwaltungsregelung")
        )
      )
    );

    // when
    mockMvc
      .perform(
        get("/api/lookup-tables/document-types")
          .param("searchQuery", searchQuery)
          .param("size", "2")
      )
      // then
      .andExpect(content().contentType(MediaType.APPLICATION_JSON))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.documentTypes[0].abbreviation").value("VE"))
      .andExpect(jsonPath("$.documentTypes[0].name").value("Verwaltungsvereinbarung"))
      .andExpect(jsonPath("$.documentTypes[1].abbreviation").value("VR"))
      .andExpect(jsonPath("$.documentTypes[1].name").value("Verwaltungsregelung"));
  }
}

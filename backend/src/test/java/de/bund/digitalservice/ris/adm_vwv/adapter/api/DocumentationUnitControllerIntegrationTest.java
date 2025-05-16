package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bund.digitalservice.ris.adm_vwv.application.DocumentationUnitPort;
import de.bund.digitalservice.ris.adm_vwv.config.SecurityConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = DocumentationUnitController.class)
@Import(SecurityConfiguration.class)
class DocumentationUnitControllerIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DocumentationUnitPort documentationUnitPort;

  @Nested
  class GetListOfDocumentUnits {

    @Test
    @DisplayName("returns HTTP 200")
    void getListOfDocumentsSuccess() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(status().isOk());
    }

    @Test
    @DisplayName("returns list of (uu)ids ")
    void getListOfDocumentsWithIds() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[0].id").value(
            "11111111-1657-4085-ae2a-993a04c27f6b"
          )
        )
        .andExpect(
          jsonPath(".paginatedDocumentUnitListElements.content[1].id").value(
            "22222222-1657-4085-ae2a-993a04c27f6b"
          )
        );
    }

    @Test
    @DisplayName("returns list of Dokumentnummern ")
    void getListOfDocumentsWithDokumentNummern() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[0].dokumentnummer").value(
            "sample dokumentnummer 1"
          )
        )
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[1].dokumentnummer").value(
            "sample dokumentnummer 2"
          )
        );
    }

    @Test
    @DisplayName("returns list of Zitierdaten ")
    void getListOfDocumentsWithZitierdatum() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[0].zitierdatum").value("2011-11-11")
        )
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[1].zitierdatum").value("2011-11-11")
        );
    }

    @Test
    @DisplayName("returns list of Langüberschriften ")
    void getListOfDocumentsWithLangueberschrift() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[0].langueberschrift").value(
            "Sample Document Title 1"
          )
        )
        .andExpect(
          jsonPath("$.paginatedDocumentUnitListElements.content[1].langueberschrift").value(
            "Sample Document Title 2"
          )
        );
    }

    @Nested
    class fundstellen {

      @Test
      @DisplayName("return array of Fundstellen")
      void getListOfDocumentsWithFundstellen() throws Exception {
        // given

        // when
        mockMvc
          .perform(get("/api/documentation-units"))
          // then
          .andExpect(
            jsonPath("$.paginatedDocumentUnitListElements.content[0].fundstellen").isNotEmpty()
          );
      }

      @Test
      @DisplayName("return array of Fundstellen with ids")
      void getListOfDocumentsWithFundstellenIds() throws Exception {
        // given

        // when
        mockMvc
          .perform(get("/api/documentation-units"))
          // then
          .andExpect(
            jsonPath("$.paginatedDocumentUnitListElements.content[0].fundstellen[0].id").value(
              "fundstellen id 1"
            )
          )
          .andExpect(
            jsonPath("$.paginatedDocumentUnitListElements.content[0].fundstellen[1].id").value(
              "fundstellen id 2"
            )
          );
      }

      @Test
      @DisplayName("return array of Fundstellen with zitatstelle")
      void getListOfDocumentsWithFundstellenZitatstellen() throws Exception {
        // given

        // when
        mockMvc
          .perform(get("/api/documentation-units"))
          // then
          .andExpect(
            jsonPath(
              "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].zitatstelle"
            ).value("zitatstelle 1")
          )
          .andExpect(
            jsonPath(
              "$.paginatedDocumentUnitListElements.content[0].fundstellen[1].zitatstelle"
            ).value("zitatstelle 2")
          );
      }

      @Nested
      class periodika {

        @Test
        @DisplayName("return array of Periodika")
        void getListOfDocumentsWithFundstellenAndPeriodika() throws Exception {
          // given

          // when
          mockMvc
            .perform(get("/api/documentation-units"))
            // then
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika"
              ).isNotEmpty()
            );
        }

        @Test
        @DisplayName("return periodika ids")
        void getListOfDocumentsWithFundstellenAndPeriodikaIds() throws Exception {
          // given

          // when
          mockMvc
            .perform(get("/api/documentation-units"))
            // then
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[0].id"
              ).value("periodikum id 1")
            )
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[1].id"
              ).value("periodikum id 2")
            );
        }

        @Test
        @DisplayName("return periodika titles")
        void getListOfDocumentsWithFundstellenAndPeriodikaTitles() throws Exception {
          // given

          // when
          mockMvc
            .perform(get("/api/documentation-units"))
            // then
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[0].title"
              ).value("periodikum title 1")
            )
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[1].title"
              ).value("periodikum title 2")
            );
        }

        @Test
        @DisplayName("return periodika subtitles")
        void getListOfDocumentsWithFundstellenAndPeriodikaSubtitles() throws Exception {
          // given

          // when
          mockMvc
            .perform(get("/api/documentation-units"))
            // then
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[0].subtitle"
              ).value("periodikum subtitle 1")
            )
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[1].subtitle"
              ).value("periodikum subtitle 2")
            );
        }

        @Test
        @DisplayName("return periodika abbreviation")
        void getListOfDocumentsWithFundstellenAndPeriodikaAbbreviation() throws Exception {
          // given

          // when
          mockMvc
            .perform(get("/api/documentation-units"))
            // then
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[0].abbreviation"
              ).value("p.abbrev.1")
            )
            .andExpect(
              jsonPath(
                "$.paginatedDocumentUnitListElements.content[0].fundstellen[0].periodika[1].abbreviation"
              ).value("p.abbrev.2")
            );
        }
      }
    }
  }
}

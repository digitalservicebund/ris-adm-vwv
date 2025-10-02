package de.bund.digitalservice.ris.adm_vwv.adapter.api;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.DocumentationUnitContent;
import de.bund.digitalservice.ris.adm_vwv.config.security.SecurityConfiguration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(controllers = DocumentationUnitController.class)
@WithMockUser(roles = "adm_user")
@Import(SecurityConfiguration.class)
class DocumentationUnitControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DocumentationUnitService documentationUnitService;

  @Test
  @DisplayName("Request GET returns HTTP 200 and data from mocked documentation unit port")
  void find() throws Exception {
    // given
    String documentNumber = "KSNR054920707";
    String json = "{\"test\":\"content\"}";
    given(documentationUnitService.findByDocumentNumber(documentNumber)).willReturn(
      Optional.of(new DocumentationUnit(documentNumber, UUID.randomUUID(), json))
    );

    // when
    mockMvc
      .perform(get("/api/documentation-units/{documentNumber}", documentNumber))
      // then
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.documentNumber").value(documentNumber))
      .andExpect(jsonPath("$.json.test").value("content"));
  }

  @Test
  @DisplayName(
    "Request GET returns HTTP 404 because mocked documentation unit port returns empty optional"
  )
  void find_notFound() throws Exception {
    // given
    String documentNumber = "KSNR000000001";
    given(documentationUnitService.findByDocumentNumber(documentNumber)).willReturn(
      Optional.empty()
    );

    // when
    mockMvc
      .perform(get("/api/documentation-units/{documentNumber}", documentNumber))
      // then
      .andExpect(status().isNotFound());
  }

  @Test
  @DisplayName("Request POST returns HTTP 201 and data from mocked documentation unit port")
  void create() throws Exception {
    // given
    UUID id = UUID.randomUUID();
    given(documentationUnitService.create()).willReturn(
      new DocumentationUnit("KSNR054920707", id, null)
    );

    // when
    mockMvc
      .perform(post("/api/documentation-units"))
      // then
      .andExpect(status().isCreated())
      .andExpect(jsonPath("$.id").value(id.toString()))
      .andExpect(jsonPath("$.documentNumber").value("KSNR054920707"));
  }

  @Test
  @DisplayName("Request PUT returns HTTP 200 and data from mocked documentation unit port")
  void update() throws Exception {
    // given
    String documentNumber = "KSNR054920707";
    String json = "{\"test\":\"content\"}";
    given(documentationUnitService.update(documentNumber, json)).willReturn(
      Optional.of(new DocumentationUnit(documentNumber, UUID.randomUUID(), json))
    );

    // when
    mockMvc
      .perform(
        put("/api/documentation-units/{documentNumber}", documentNumber)
          .content(json)
          .contentType(MediaType.APPLICATION_JSON)
      )
      // then
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.documentNumber").value(documentNumber))
      .andExpect(jsonPath("$.json.test").value("content"));
  }

  @Test
  @DisplayName(
    "Request PUT returns HTTP 404 because mocked documentation unit port returns empty optional"
  )
  void update_notFound() throws Exception {
    // given
    String documentNumber = "KSNR000000001";
    String json = "{\"test\":\"unsuccessful\"}";
    given(documentationUnitService.update(documentNumber, json)).willReturn(Optional.empty());

    // when
    mockMvc
      .perform(
        put("/api/documentation-units/{documentNumber}", documentNumber)
          .content(json)
          .contentType(MediaType.APPLICATION_JSON)
      )
      // then
      .andExpect(status().isNotFound());
  }

  @Nested
  class PaginatedListOfDocumentUnits {

    @BeforeEach
    void beforeEach() {
      given(documentationUnitService.findDocumentationUnitOverviewElements(any())).willReturn(
        TestPage.create(
          List.of(
            new DocumentationUnitOverviewElement(
              UUID.fromString("11111111-1657-4085-ae2a-993a04c27f6b"),
              "KSNR000004711",
              List.of("2011-11-11"),
              "Sample Document Title 1",
              List.of("p.abbrev.1 zitatstelle 1", "p.abbrev.2 zitatstelle 2")
            ),
            new DocumentationUnitOverviewElement(
              UUID.fromString("22222222-1657-4085-ae2a-993a04c27f6b"),
              "KSNR000004712",
              List.of("2011-11-11"),
              "Sample Document Title 2",
              List.of()
            )
          )
        )
      );
    }

    @Test
    @DisplayName("returns HTTP 200, uuids, Dokumentnummern, Zitierdaten, Langüberschriften")
    void findListOfDocumentsSuccess() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(status().isOk())
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].id").value(
            "11111111-1657-4085-ae2a-993a04c27f6b"
          )
        )
        .andExpect(
          jsonPath("$.documentationUnitsOverview[1].id").value(
            "22222222-1657-4085-ae2a-993a04c27f6b"
          )
        )
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].documentNumber").value("KSNR000004711")
        )
        .andExpect(
          jsonPath("$.documentationUnitsOverview[1].documentNumber").value("KSNR000004712")
        )
        .andExpect(jsonPath("$.documentationUnitsOverview[0].zitierdaten[0]").value("2011-11-11"))
        .andExpect(jsonPath("$.documentationUnitsOverview[1].zitierdaten[0]").value("2011-11-11"))
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].langueberschrift").value(
            "Sample Document Title 1"
          )
        )
        .andExpect(
          jsonPath("$.documentationUnitsOverview[1].langueberschrift").value(
            "Sample Document Title 2"
          )
        );
    }

    @Test
    @DisplayName("return array of Fundstellen")
    void findListOfDocumentsWithFundstellen() throws Exception {
      // given

      // when
      mockMvc
        .perform(get("/api/documentation-units"))
        // then
        .andExpect(jsonPath("$.documentationUnitsOverview[0].fundstellen").isNotEmpty())
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].fundstellen[0]").value(
            "p.abbrev.1 zitatstelle 1"
          )
        )
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].fundstellen[1]").value(
            "p.abbrev.2 zitatstelle 2"
          )
        );
    }

    @Test
    @DisplayName("sends search parameters to the application layer")
    void findListOfDocumentsWithSearchParamsSuccess() throws Exception {
      // given
      String documentNumber = "KSNR000004711";
      String langueberschrift = "Sample Document";
      String fundstellen = "p.abbrev.1";
      String zitierdaten = "2011-11-11";

      QueryOptions queryOptions = new QueryOptions(
        0,
        10,
        "documentNumber",
        Sort.Direction.DESC,
        true
      );
      DocumentationUnitQuery expectedQuery = new DocumentationUnitQuery(
        documentNumber,
        langueberschrift,
        fundstellen,
        zitierdaten,
        queryOptions
      );

      given(
        documentationUnitService.findDocumentationUnitOverviewElements(expectedQuery)
      ).willReturn(
        TestPage.create(
          List.of(
            new DocumentationUnitOverviewElement(
              UUID.randomUUID(),
              documentNumber,
              List.of(zitierdaten),
              langueberschrift,
              List.of(fundstellen)
            )
          )
        )
      );

      // when
      mockMvc
        .perform(
          get("/api/documentation-units")
            .param("documentNumber", documentNumber)
            .param("langueberschrift", langueberschrift)
            .param("fundstellen", fundstellen)
            .param("zitierdaten", zitierdaten)
        )
        // then
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.documentationUnitsOverview[0].documentNumber").value(documentNumber))
        .andExpect(jsonPath("$.documentationUnitsOverview[0].zitierdaten").value(zitierdaten))
        .andExpect(jsonPath("$.documentationUnitsOverview[0].fundstellen").value(fundstellen))
        .andExpect(
          jsonPath("$.documentationUnitsOverview[0].langueberschrift").value(langueberschrift)
        );
    }

    @ParameterizedTest
    @MethodSource("sortPropertyMappingProvider")
    @DisplayName("should correctly map all sort properties")
    void shouldCorrectlyMapSortByProperty(String requestSortProperty, String expectedSortProperty)
      throws Exception {
      // given
      given(
        documentationUnitService.findDocumentationUnitOverviewElements(
          any(DocumentationUnitQuery.class)
        )
      ).willReturn(TestPage.create(List.of()));

      // when
      mockMvc
        .perform(get("/api/documentation-units").param("sortByProperty", requestSortProperty))
        .andExpect(status().isOk());

      // then
      ArgumentCaptor<DocumentationUnitQuery> queryCaptor = ArgumentCaptor.forClass(
        DocumentationUnitQuery.class
      );
      verify(documentationUnitService).findDocumentationUnitOverviewElements(queryCaptor.capture());

      DocumentationUnitQuery capturedQuery = queryCaptor.getValue();
      assertThat(capturedQuery.queryOptions().sortByProperty()).isEqualTo(expectedSortProperty);
    }

    private static Stream<Arguments> sortPropertyMappingProvider() {
      return Stream.of(
        Arguments.of("langueberschrift", "documentationUnitIndex.langueberschrift"),
        Arguments.of("fundstellen", "documentationUnitIndex.fundstellen"),
        Arguments.of("zitierdaten", "documentationUnitIndex.zitierdaten"),
        Arguments.of("documentNumber", "documentNumber"),
        Arguments.of(null, "documentNumber")
      );
    }
  }

  @Nested
  @DisplayName("Publish Endpoint")
  class PublishEndpointValidationTests {

    @Test
    @DisplayName("Request PUT on publish returns HTTP 200 for a valid request")
    void publish_success() throws Exception {
      // given
      String documentNumber = "KSNR054920707";
      String validJsonRequest =
        """
        {
          "langueberschrift": "Gültige Überschrift",
          "zitierdaten": ["2023-01-01"],
          "inkrafttretedatum": "2023-01-01",
          "dokumenttyp": { "abbreviation": "TYPE_A", "name": "Type A Document" },
          "normgeberList": [
              {
                "id": "c1d2e3f4-a5b6-7890-1234-567890abcdef",
                "institution": { "name": "Bundesministerium der Justiz", "type": "INSTITUTION" },
                "regions": [{ "code": "DE" }]
              }
          ]
        }""";

      given(
        documentationUnitService.publish(any(String.class), any(DocumentationUnitContent.class))
      ).willReturn(
        Optional.of(new DocumentationUnit(documentNumber, UUID.randomUUID(), validJsonRequest))
      );

      // when
      mockMvc
        .perform(
          put("/api/documentation-units/{documentNumber}/publish", documentNumber)
            .content(validJsonRequest)
            .contentType(MediaType.APPLICATION_JSON)
        )
        // then
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.documentNumber").value(documentNumber));
    }

    @ParameterizedTest(name = "returns HTTP 400 for invalid field: {0}")
    @MethodSource("invalidPublishPayloads")
    @DisplayName("Request PUT on publish returns HTTP 400 for invalid data")
    void publish_validationFails(String fieldName, String payload) throws Exception {
      // given
      String documentNumber = "KSNR000000001";

      // when
      mockMvc
        .perform(
          put("/api/documentation-units/{documentNumber}/publish", documentNumber)
            .content(payload)
            .contentType(MediaType.APPLICATION_JSON)
        )
        // then
        .andExpect(status().isBadRequest());
    }

    private static Stream<Arguments> invalidPublishPayloads() {
      String baseJson =
        """
        {
          "langueberschrift": "Eine gültige Überschrift",
          "zitierdaten": ["2023-10-26"],
          "inkrafttretedatum": "2023-10-26",
          "dokumenttyp": { "abbreviation": "TYPE_A", "name": "Type A Document" },
          "normgeberList": [
            {
              "id": "c1d2e3f4-a5b6-7890-1234-567890abcdef",
              "institution": { "name": "Bundesministerium der Justiz", "type": "INSTITUTION" },
              "regions": [{ "code": "DE" }]
            }
          ]
        }
        """;

      return Stream.of(
        Arguments.of(
          "langueberschrift",
          baseJson.replace(
            "\"langueberschrift\": \"Eine gültige Überschrift\"",
            "\"langueberschrift\": \"  \""
          )
        ),
        Arguments.of(
          "zitierdaten",
          baseJson.replace("\"zitierdaten\": [\"2023-10-26\"]", "\"zitierdaten\": []")
        ),
        Arguments.of(
          "inkrafttretedatum",
          baseJson.replace("\"inkrafttretedatum\": \"2023-10-26\"", "\"inkrafttretedatum\": \"\"")
        ),
        Arguments.of(
          "dokumenttyp",
          baseJson.replace(
            "\"dokumenttyp\": { \"abbreviation\": \"TYPE_A\", \"name\": \"Type A Document\" }",
            "\"dokumenttyp\": null"
          )
        ),
        Arguments.of(
          "normgeberList",
          """
          {
            "langueberschrift": "Eine gültige Überschrift",
            "zitierdaten": ["2023-10-26"],
            "inkrafttretedatum": "2023-10-26",
            "dokumenttyp": { "abbreviation": "TYPE_A", "name": "Type A Document" },
            "normgeberList": []
          }
          """
        )
      );
    }

    @Test
    @DisplayName(
      "Request PUT on publish returns HTTP 404 because mocked documentation unit port returns empty optional"
    )
    void publish_notFound() throws Exception {
      // given
      String documentNumber = "KSNR000000001";
      String validJsonRequest =
        """
        {
          "langueberschrift": "Gültige Überschrift",
          "zitierdaten": ["2023-01-01"],
          "inkrafttretedatum": "2023-01-01",
          "dokumenttyp": { "abbreviation": "TYPE_A", "name": "Type A Document" },
          "normgeberList": [
              {
                "id": "c1d2e3f4-a5b6-7890-1234-567890abcdef",
                "institution": { "name": "Bundesministerium der Justiz", "type": "INSTITUTION" },
                "regions": [{ "code": "DE" }]
              }
          ]
        }""";

      given(
        documentationUnitService.publish(any(String.class), any(DocumentationUnitContent.class))
      ).willReturn(Optional.empty());

      // when
      mockMvc
        .perform(
          put("/api/documentation-units/{documentNumber}/publish", documentNumber)
            .content(validJsonRequest)
            .contentType(MediaType.APPLICATION_JSON)
        )
        // then
        .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Request PUT on publish returns HTTP 503 when external publishing fails")
    void publish_externalFailure() throws Exception {
      // given
      String documentNumber = "KSNR054920707";
      String validJsonRequest =
        """
        {
          "langueberschrift": "Gültige Überschrift",
          "zitierdaten": ["2023-01-01"],
          "inkrafttretedatum": "2023-01-01",
          "dokumenttyp": { "abbreviation": "TYPE_A", "name": "Type A Document" },
          "normgeberList": [
              {
                "id": "c1d2e3f4-a5b6-7890-1234-567890abcdef",
                "institution": { "name": "Bundesministerium der Justiz", "type": "INSTITUTION" },
                "regions": [{ "code": "DE" }]
              }
          ]
        }""";

      given(
        documentationUnitService.publish(any(String.class), any(DocumentationUnitContent.class))
      ).willThrow(
        new PublishingFailedException("External system unavailable", new RuntimeException())
      );

      // when
      mockMvc
        .perform(
          put("/api/documentation-units/{documentNumber}/publish", documentNumber)
            .content(validJsonRequest)
            .contentType(MediaType.APPLICATION_JSON)
        )
        // then
        .andExpect(status().isServiceUnavailable());
    }
  }
}

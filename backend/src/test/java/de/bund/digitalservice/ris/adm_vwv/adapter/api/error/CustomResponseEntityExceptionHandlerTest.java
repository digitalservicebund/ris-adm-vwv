package de.bund.digitalservice.ris.adm_vwv.adapter.api.error;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.bund.digitalservice.ris.adm_vwv.adapter.api.WithMockJwt;
import de.bund.digitalservice.ris.adm_vwv.config.SecurityConfiguration;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(TestController.class)
@Import(SecurityConfiguration.class)
@WithMockJwt
class CustomResponseEntityExceptionHandlerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("Request test controller and expects JSON response with error message")
  void handleMethodArgumentNotValid() throws Exception {
    // given

    // when
    mockMvc
      .perform(
        post("/api/test")
          .contentType(MediaType.APPLICATION_JSON)
          .content(
            """
            { "number" :  0 }"""
          )
      )
      // then
      .andExpect(status().isBadRequest())
      .andExpect(jsonPath("$.fieldErrors[0]").value("number: must be greater than or equal to 1"));
  }

  @Test
  @DisplayName("Request test controller and expects JSON response with error message")
  void handleAllExceptions() throws Exception {
    // given

    // when
    mockMvc
      .perform(get("/api/exception"))
      // then
      .andExpect(status().isInternalServerError())
      .andExpect(jsonPath("$.detail").value("Something went wrong"));
  }
}

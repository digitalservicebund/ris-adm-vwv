package de.bund.digitalservice.ris.adm_vwv.adapter.api.error;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
class TestController {

  @PostMapping("/api/test")
  public void postTest(@Valid @RequestBody TestRequest testRequest) {
    log.debug(testRequest.toString());
  }

  @GetMapping("/api/exception")
  public String getException() {
    throw new IllegalStateException("Something went wrong");
  }

  record TestRequest(@NotNull @Min(1) Integer number) {}
}

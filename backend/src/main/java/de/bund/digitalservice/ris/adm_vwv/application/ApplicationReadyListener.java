package de.bund.digitalservice.ris.adm_vwv.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Respond to application startup completion
 */
@Component
@Slf4j
public class ApplicationReadyListener {

  @EventListener(ApplicationReadyEvent.class)
  public void logAfterStartup() {
    log.info("\n\n--> NeuRIS ADM VwV Backend Startup completed <--\n");
  }
}

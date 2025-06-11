package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import jakarta.annotation.PostConstruct;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

/**
 * Cron job for executing indexing of documentation units.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentationUnitIndexJob {

  private final DocumentationUnitPersistenceService documentationUnitPersistenceService;

  /**
   * Execute indexing of all documentation units without documentation unit index.
   */
  @Scheduled(cron = "${cronjob.DocumentationUnitIndexJob:-}", zone = "Europe/Berlin")
  @PostConstruct
  public void indexAll() {
    StopWatch stopWatch = new StopWatch("Index documentation units");
    stopWatch.start();
    long totalNumberOfElements = documentationUnitPersistenceService.indexAll();
    stopWatch.stop();
    log.info(
      "Indexing {} documentation units finished. \n{}",
      totalNumberOfElements,
      stopWatch.prettyPrint(TimeUnit.SECONDS)
    );
  }
}

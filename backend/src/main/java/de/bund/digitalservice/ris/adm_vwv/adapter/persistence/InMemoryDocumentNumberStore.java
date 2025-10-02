package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Component;

/**
 * Temporary class to create LIT sequential numbers
 */
// TODO: Remove once RISDEV-9545 is implemented // NOSONAR
@Component
public class InMemoryDocumentNumberStore {

  private final Map<String, AtomicInteger> counters = new ConcurrentHashMap<>();

  /**
   * Gets the next number in the sequence for a given series key.
   * If the key is new, it starts the sequence at 1.
   *
   * @param sequenceKey The prefix + year
   * @return The next integer in the sequence.
   */
  public int getNextNumber(String sequenceKey) {
    return counters.computeIfAbsent(sequenceKey, _ -> new AtomicInteger(0)).incrementAndGet();
  }
}

package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchException;

import java.time.Year;
import java.util.stream.Stream;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class DocumentNumberTest {

  private static Stream<Arguments> latestDocumentNumbers() {
    return Stream.of(
      Arguments.of("KSNR", Year.of(2025), null, "KSNR2025000001"),
      Arguments.of("KSNR", Year.of(2026), null, "KSNR2026000001"),
      Arguments.of("KSNR", Year.of(2025), "KSNR2025000001", "KSNR2025000002"),
      Arguments.of("KSNR", Year.of(2025), "KSNR2025099999", "KSNR2025100000"),
      Arguments.of("KALU", Year.of(2025), null, "KALU2025000001"),
      Arguments.of("KALU", Year.of(2025), "KALU2025000042", "KALU2025000043")
    );
  }

  @ParameterizedTest
  @MethodSource("latestDocumentNumbers")
  void create(String prefix, Year year, String latestDocumentNumber, String expected) {
    // given
    var documentNumber = new DocumentNumber(prefix, year, latestDocumentNumber);

    // when
    String actual = documentNumber.create();

    // then
    assertThat(actual).isEqualTo(expected);
  }

  private static Stream<Arguments> failingDocumentNumbers() {
    return Stream.of(
      // prefix, year, latestDocumentNumber
      Arguments.of("KSNR", Year.of(2025), "KSNE2025000001"),
      Arguments.of("KSNR", Year.of(2025), "KSNR2024000001"),
      Arguments.of("KSNR", Year.of(2025), "KSNR202500001")
    );
  }

  @ParameterizedTest
  @MethodSource("failingDocumentNumbers")
  void create_failures(String prefix, Year year, String latestDocumentNumber) {
    // given
    var documentNumber = new DocumentNumber(prefix, year, latestDocumentNumber);

    // when
    Exception exception = catchException(documentNumber::create);

    // then
    assertThat(exception).isInstanceOf(RuntimeException.class);
  }
}

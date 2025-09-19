package de.bund.digitalservice.ris.adm_vwv.adapter.publishing;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.xml.sax.SAXException;

class XmlValidatorTest {

  private final String validXml =
    """
    <note>
        <to>Tove</to>
        <from>Frombert</from>
        <body>Remember me this weekend!</body>
    </note>
    """;

  private final String invalidXml =
    """
    <note>
        <to>Tove</to>
        <heading>Reminder</heading>
    </note>
    """;

  @Test
  void constructor_shouldThrowException_whenSchemaListIsEmpty() {
    List<String> emptyList = Collections.emptyList();
    assertThatThrownBy(() -> new XmlValidator(emptyList)).isInstanceOf(
      IllegalArgumentException.class
    );
  }

  @Test
  void constructor_shouldThrowException_whenSchemaPathIsNotFound() {
    List<String> nonExistentPath = List.of("/non/existent/path.xsd");
    assertThatThrownBy(() -> new XmlValidator(nonExistentPath)).isInstanceOf(
      IllegalArgumentException.class
    );
  }

  @Test
  void validate_shouldSucceed_forValidXml() {
    XmlValidator validator = new XmlValidator(List.of("/schemas/test-schema.xsd"));
    assertThatCode(() -> validator.validate(validXml)).doesNotThrowAnyException();
  }

  @Test
  void validate_shouldThrowException_forInvalidXml() {
    XmlValidator validator = new XmlValidator(List.of("/schemas/test-schema.xsd"));
    assertThatThrownBy(() -> validator.validate(invalidXml)).isInstanceOf(SAXException.class);
  }
}

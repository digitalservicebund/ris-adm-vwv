package de.bund.digitalservice.ris.adm_vwv.config;

import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.XmlValidator;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for the XML Validators.
 */
@Configuration
public class ValidatorConfig {

  /**
   * Bean for bsg vwv validation
   * @return Configured bsg validator
   */
  @Bean("bsgVwvValidator")
  public XmlValidator bsgVwvValidator() {
    return new XmlValidator(
      List.of(
        "/schemas/akomaNtoso/akomantoso30.xsd",
        "/schemas/proprietary/bsg-vwv/ldml-ris-metadata.xsd"
      )
    );
  }
}

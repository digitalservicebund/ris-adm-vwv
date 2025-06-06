package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import de.bund.digitalservice.ris.adm_vwv.application.FieldOfLaw;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPersistencePort;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

@SpringJUnitConfig
class FieldsOfLawTransformerTest {

  @InjectMocks
  private FieldsOfLawTransformer fieldsOfLawTransformer;

  @Mock
  private LookupTablesPersistencePort lookupTablesPersistencePort;

  @Test
  @DisplayName("Transforms two fields of law")
  void transform() {
    // given
    AkomaNtoso akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    doc.setMeta(meta);
    Proprietary proprietary = new Proprietary();
    meta.setProprietary(proprietary);
    RisMetadata risMetadata = new RisMetadata();
    proprietary.setMetadata(risMetadata);
    risMetadata.setFieldsOfLaw(List.of(createRisFieldOfLaw("PR-05-01")));
    given(lookupTablesPersistencePort.findFieldOfLaw("PR-05-01")).willReturn(
      Optional.of(
        new FieldOfLaw(
          UUID.randomUUID(),
          false,
          "PR-05-01",
          "Phantasierecht",
          "NEW",
          List.of(),
          List.of(),
          List.of(),
          null
        )
      )
    );
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:proprietary>
    //         <ris:metadata>
    //           <ris:fieldsOfLaw>
    //             <ris:fieldOfLaw notation="NEW">PR-05-01</ris:fieldOfLaw>
    //           </ris:fieldsOfLaw>
    //         </ris:metadata>
    //       </akn:proprietary>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<FieldOfLaw> fieldsOfLaw = fieldsOfLawTransformer.transform(akomaNtoso);

    // then
    assertThat(fieldsOfLaw)
      .singleElement()
      .extracting(FieldOfLaw::identifier, FieldOfLaw::text)
      .containsExactly("PR-05-01", "Phantasierecht");
  }

  @Test
  @DisplayName(
    "Transform of field of law does not find field of law in database and returns only object with identifier"
  )
  void transform_FieldOfLawNotFound() {
    // given
    AkomaNtoso akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    doc.setMeta(meta);
    Proprietary proprietary = new Proprietary();
    meta.setProprietary(proprietary);
    RisMetadata risMetadata = new RisMetadata();
    proprietary.setMetadata(risMetadata);
    risMetadata.setFieldsOfLaw(List.of(createRisFieldOfLaw("RR-00-11")));
    given(lookupTablesPersistencePort.findFieldOfLaw("RR-00-11")).willReturn(
      Optional.of(
        new FieldOfLaw(
          UUID.randomUUID(),
          false,
          "RR-00-11",
          "RR-00-11",
          "NEW",
          List.of(),
          List.of(),
          List.of(),
          null
        )
      )
    );
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:proprietary>
    //         <ris:metadata>
    //           <ris:fieldsOfLaw>
    //             <ris:fieldOfLaw notation="NEW">RR-00-11</ris:fieldOfLaw>
    //           </ris:fieldsOfLaw>
    //         </ris:metadata>
    //       </akn:proprietary>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<FieldOfLaw> fieldsOfLaw = fieldsOfLawTransformer.transform(akomaNtoso);

    // then
    assertThat(fieldsOfLaw)
      .singleElement()
      .extracting(FieldOfLaw::identifier, FieldOfLaw::text)
      .containsOnly("RR-00-11");
  }

  @Test
  @DisplayName("Missing proprietary element is transformed to an empty list")
  void transform_noProprietaryElement() {
    // given
    AkomaNtoso akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    doc.setMeta(meta);
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<FieldOfLaw> fieldsOfLaw = fieldsOfLawTransformer.transform(akomaNtoso);

    // then
    assertThat(fieldsOfLaw).isEmpty();
  }

  @Test
  @DisplayName("Missing fields of law elements are transformed to an empty list")
  void transform_noFieldsOfLawElement() {
    // given
    AkomaNtoso akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    doc.setMeta(meta);
    Proprietary proprietary = new Proprietary();
    meta.setProprietary(proprietary);
    RisMetadata risMetadata = new RisMetadata();
    proprietary.setMetadata(risMetadata);
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:proprietary>
    //       </akn:proprietary>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<FieldOfLaw> fieldsOfLaw = fieldsOfLawTransformer.transform(akomaNtoso);

    // then
    assertThat(fieldsOfLaw).isEmpty();
  }

  private RisFieldOfLaw createRisFieldOfLaw(String identifier) {
    RisFieldOfLaw risFieldOfLaw = new RisFieldOfLaw();
    risFieldOfLaw.setNotation("NEW");
    risFieldOfLaw.setValue(identifier);
    return risFieldOfLaw;
  }
}

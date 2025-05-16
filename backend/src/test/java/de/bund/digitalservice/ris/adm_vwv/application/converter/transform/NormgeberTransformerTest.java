package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;

import de.bund.digitalservice.ris.adm_vwv.application.Institution;
import de.bund.digitalservice.ris.adm_vwv.application.InstitutionType;
import de.bund.digitalservice.ris.adm_vwv.application.LookupTablesPersistencePort;
import de.bund.digitalservice.ris.adm_vwv.application.Region;
import de.bund.digitalservice.ris.adm_vwv.application.converter.business.Normgeber;
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
class NormgeberTransformerTest {

  @InjectMocks
  private NormgeberTransformer normgeberTransformer;

  @Mock
  private LookupTablesPersistencePort lookupTablesPersistencePort;

  @Test
  @DisplayName("Transforms two normgeber, one legal entity and one institution with region")
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
    risMetadata.setNormgeber(
      List.of(
        createRisNormgeber("DS", null),
        createRisNormgeber("BRD", "Ministerium für Digitales")
      )
    );
    given(lookupTablesPersistencePort.findInstitutionByName("DS")).willReturn(
      createInstitution("DS", InstitutionType.LEGAL_ENTITY)
    );
    given(
      lookupTablesPersistencePort.findInstitutionByName("Ministerium für Digitales")
    ).willReturn(createInstitution("Ministerium für Digitales", InstitutionType.INSTITUTION));
    given(lookupTablesPersistencePort.findRegionByCode("BRD")).willReturn(createRegion());

    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:proprietary>
    //         <ris:metadata>
    //           <ris:normgeber staat="DS" />
    //           <ris:normgeber staat="BRD" organ="Ministerium für Digitales" />
    //         </ris:metadata>
    //       </akn:proprietary>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<Normgeber> normgeberList = normgeberTransformer.transform(akomaNtoso);

    // then
    assertThat(normgeberList)
      .hasSize(2)
      .extracting(
        normgeber -> normgeber.institution().name(),
        normgeber -> normgeber.institution().type(),
        normgeber -> normgeber.regions().stream().map(Region::code).toList()
      )
      .containsExactly(
        tuple("DS", InstitutionType.LEGAL_ENTITY, List.of()),
        tuple("Ministerium für Digitales", InstitutionType.INSTITUTION, List.of("BRD"))
      );
  }

  @Test
  @DisplayName(
    "Transform of normgeber institution which does not exists results into an runtime exception"
  )
  void transform_institutionNotFound() {
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
    risMetadata.setNormgeber(List.of(createRisNormgeber("Zaubereikammer Berlin", null)));
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:proprietary>
    //         <ris:metadata>
    //           <ris:normgeber staat="Zaubereikammer Berlin" />
    //         </ris:metadata>
    //       </akn:proprietary>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    Exception exception = catchException(() -> normgeberTransformer.transform(akomaNtoso));

    // then
    assertThat(exception).isInstanceOf(IllegalArgumentException.class);
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
    List<Normgeber> normgeberList = normgeberTransformer.transform(akomaNtoso);

    // then
    assertThat(normgeberList).isEmpty();
  }

  @Test
  @DisplayName("Missing normgeber elements are transformed to an empty list")
  void transform_noNormgeberElement() {
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
    List<Normgeber> normgeberList = normgeberTransformer.transform(akomaNtoso);

    // then
    assertThat(normgeberList).isEmpty();
  }

  private Optional<Region> createRegion() {
    return Optional.of(new Region(UUID.randomUUID(), "BRD", "Bundesrepublik Deutschland"));
  }

  private Optional<Institution> createInstitution(String name, InstitutionType institutionType) {
    return Optional.of(new Institution(UUID.randomUUID(), name, name, institutionType, List.of()));
  }

  private RisNormgeber createRisNormgeber(String staat, String organ) {
    RisNormgeber risNormgeber = new RisNormgeber();
    risNormgeber.setStaat(staat);
    risNormgeber.setOrgan(organ);
    return risNormgeber;
  }
}

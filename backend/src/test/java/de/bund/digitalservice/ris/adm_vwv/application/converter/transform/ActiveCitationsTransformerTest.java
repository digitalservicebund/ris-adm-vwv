package de.bund.digitalservice.ris.adm_vwv.application.converter.transform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

import de.bund.digitalservice.ris.adm_vwv.application.converter.business.ActiveCitation;
import de.bund.digitalservice.ris.adm_vwv.application.converter.ldml.*;
import java.util.List;
import org.junit.jupiter.api.Test;

class ActiveCitationsTransformerTest {

  @Test
  void transform() {
    // given
    AkomaNtoso akomaNtoso = new AkomaNtoso();
    Doc doc = new Doc();
    akomaNtoso.setDoc(doc);
    Meta meta = new Meta();
    doc.setMeta(meta);
    Analysis analysis = new Analysis();
    meta.setAnalysis(analysis);
    analysis.setOtherReferences(
      List.of(createOtherReference("Vgl", "XY-01"), createOtherReference("Anw", "ZZ-02"))
    );
    // <akn:akomaNtoso>
    //   <akn:doc name="offene-struktur">
    //     <akn:meta>
    //       <akn:analysis source="attributsemantik-noch-undefiniert">
    //         <akn:otherReferences source="attributsemantik-noch-undefiniert">
    //          <akn:implicitReference shortForm="Vgl PhanGH XY-01" showAs="Vgl PhanGH XY-01 2025-06-06">
    //            <ris:caselawReference abbreviation="Vgl" court="PhanGH" date="2025-06-06" referenceNumber="XY-01"
    //                                  documentNumber="KSNR0000000001"/>
    //          </akn:implicitReference>
    //        </akn:otherReferences>
    //        <akn:otherReferences source="attributsemantik-noch-undefiniert">
    //          <akn:implicitReference shortForm="Anw PhanGH ZZ-02" showAs="Anw PhanGH ZZ-02 2025-06-06">
    //            <ris:caselawReference abbreviation="Vgl" court="PhanGH" date="2025-06-06" referenceNumber="ZZ-02"
    //                                  documentNumber="KSNR0000000001"/>
    //          </akn:implicitReference>
    //        </akn:otherReferences>
    //       </akn:analysis>
    //     </akn:meta>
    //   </akn:doc>
    // </akn:akomaNtoso>

    // when
    List<ActiveCitation> activeCitations = new ActiveCitationsTransformer(akomaNtoso).transform();

    // then
    assertThat(activeCitations)
      .hasSize(2)
      .extracting(ac -> ac.citationType().jurisShortcut(), ActiveCitation::fileNumber)
      .containsExactly(tuple("Vgl", "XY-01"), tuple("Anw", "ZZ-02"));
  }

  @Test
  void transform_noAnalysisElement() {
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
    List<ActiveCitation> activeCitations = new ActiveCitationsTransformer(akomaNtoso).transform();

    // then
    assertThat(activeCitations).isEmpty();
  }

  private OtherReferences createOtherReference(String citationType, String referenceNumber) {
    OtherReferences otherReferences = new OtherReferences();
    ImplicitReference implicitReference = new ImplicitReference();
    RisCaselawReference risCaselawReference = new RisCaselawReference();
    risCaselawReference.setAbbreviation(citationType);
    risCaselawReference.setReferenceNumber(referenceNumber);
    risCaselawReference.setDate("2025-06-06");
    risCaselawReference.setDocumentNumber("KSNR0000000001");
    risCaselawReference.setCourt("PhanGH");
    risCaselawReference.setCourtLocation("Berlin");
    implicitReference.setCaselawReference(risCaselawReference);
    otherReferences.setImplicitReferences(List.of(implicitReference));
    return otherReferences;
  }
}

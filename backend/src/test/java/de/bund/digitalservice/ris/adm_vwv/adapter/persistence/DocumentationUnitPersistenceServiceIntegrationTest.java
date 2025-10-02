package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static de.bund.digitalservice.ris.adm_vwv.adapter.persistence.DocumentationUnitPersistenceService.ENTRY_SEPARATOR;
import static org.assertj.core.api.Assertions.assertThat;

import de.bund.digitalservice.ris.adm_vwv.application.*;
import de.bund.digitalservice.ris.adm_vwv.test.TestFile;
import de.bund.digitalservice.ris.adm_vwv.test.WithMockAdmUser;
import jakarta.persistence.TypedQuery;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.assertj.core.api.InstanceOfAssertFactories;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureTestEntityManager;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
@AutoConfigureTestEntityManager
@ActiveProfiles("test")
class DocumentationUnitPersistenceServiceIntegrationTest {

  @Autowired
  private TestEntityManager entityManager;

  @Autowired
  private DocumentationUnitPersistenceService documentationUnitPersistenceService;

  private void createTestUnit(
    String documentNumber,
    String langueberschrift,
    String fundstellen,
    String zitierdaten
  ) {
    var unit = new DocumentationUnitEntity();
    unit.setDocumentNumber(documentNumber);
    entityManager.persist(unit);

    var index = new DocumentationUnitIndexEntity();
    index.setDocumentationUnit(unit);
    unit.setDocumentationUnitIndex(index);
    index.setLangueberschrift(langueberschrift);
    index.setFundstellen(fundstellen);
    index.setZitierdaten(zitierdaten);
    entityManager.persistAndFlush(index);
  }

  @Test
  void findByDocumentNumber() {
    // given
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    Year thisYear = Year.now();
    documentationUnitEntity.setDocumentNumber(String.format("KSNR%s000002", thisYear));
    documentationUnitEntity.setJson("{\"test\":\"content\"");
    entityManager.persistAndFlush(documentationUnitEntity);

    // when
    Optional<DocumentationUnit> documentationUnit =
      documentationUnitPersistenceService.findByDocumentNumber(
        documentationUnitEntity.getDocumentNumber()
      );

    // then
    assertThat(documentationUnit)
      .isPresent()
      .hasValueSatisfying(actual -> assertThat(actual.json()).isEqualTo("{\"test\":\"content\""));
  }

  @Test
  @WithMockAdmUser
  void create() {
    // given

    // when
    DocumentationUnit documentationUnit = documentationUnitPersistenceService.create();

    // then
    assertThat(
      entityManager.find(DocumentationUnitEntity.class, documentationUnit.id())
    ).isNotNull();
  }

  @Test
  void update() {
    // given
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR2025000001");
    UUID id = entityManager.persistFlushFind(documentationUnitEntity).getId();

    // when
    documentationUnitPersistenceService.update(
      documentationUnitEntity.getDocumentNumber(),
      "{\"test\":\"content\"}"
    );

    // then
    assertThat(entityManager.find(DocumentationUnitEntity.class, id))
      .extracting(DocumentationUnitEntity::getJson)
      .isEqualTo("{\"test\":\"content\"}");
  }

  @Test
  void update_reindex() {
    // given
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR111111111");
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);
    DocumentationUnitIndexEntity documentationUnitIndexEntity = new DocumentationUnitIndexEntity();
    documentationUnitIndexEntity.setDocumentationUnit(documentationUnitEntity);
    documentationUnitIndexEntity.setLangueberschrift("Lang");
    documentationUnitIndexEntity.setFundstellen("Fund");
    documentationUnitIndexEntity.setZitierdaten("2012-12-12");
    documentationUnitIndexEntity = entityManager.persistFlushFind(documentationUnitIndexEntity);
    documentationUnitEntity.setDocumentationUnitIndex(documentationUnitIndexEntity);
    documentationUnitEntity = entityManager.merge(documentationUnitEntity);
    String json = TestFile.readFileToString("json-example.json");

    // when
    documentationUnitPersistenceService.update(documentationUnitEntity.getDocumentNumber(), json);

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(
        "1. Bekanntmachung zum XML-Testen in NeuRIS VwV",
        "Das Periodikum 2021, Seite 15",
        "2025-05-05%s2025-06-01".formatted(ENTRY_SEPARATOR)
      );
  }

  @Test
  void update_notFound() {
    // given

    // when
    documentationUnitPersistenceService.update("gibtsnicht", "{\"test\":\"content\"");

    // then
    TypedQuery<DocumentationUnitEntity> query = entityManager
      .getEntityManager()
      .createQuery(
        "from DocumentationUnitEntity where documentNumber = 'gibtsnicht'",
        DocumentationUnitEntity.class
      );
    assertThat(query.getResultList()).isEmpty();
  }

  @Test
  @DisplayName("After publishing a documentation unit, given JSON and XML is returned.")
  void publish() {
    // given
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR2025000001p");
    UUID id = entityManager.persistFlushFind(documentationUnitEntity).getId();

    // when
    String xml = TestFile.readFileToString("ldml-example.akn.xml");
    String json = TestFile.readFileToString("json-example.json");
    documentationUnitPersistenceService.publish(
      documentationUnitEntity.getDocumentNumber(),
      json,
      xml
    );

    // then
    assertThat(entityManager.find(DocumentationUnitEntity.class, id))
      .extracting(DocumentationUnitEntity::getJson, DocumentationUnitEntity::getXml)
      .containsExactly(json, xml);
  }

  @Test
  @DisplayName(
    "If a document with an unknown ID is published, this does not lead to creating the document."
  )
  void publish_notFound() {
    // given

    // when
    DocumentationUnit published = documentationUnitPersistenceService.publish(
      "gibtsnicht",
      "{\"test\":\"content\"",
      "<akn:akomaNtoso/>"
    );

    // then
    assertThat(published).isNull();
  }

  @Test
  void findDocumentationUnitOverviewElements() {
    // given
    var documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR2025100001");
    documentationUnitEntity.setJson(
      """
      {
        "id": "11111111-1657-4085-ae2a-993a04c27f6b",
        "documentNumber": "KSNR000004711",
        "zitierdaten": [ "2011-11-11" ],
        "langueberschrift": "Sample Document Title 1",
        "references": [
          {
            "id": "11111111-1fd3-4fb8-bc1d-9751ad192665",
            "citation": "zitatstelle 1",
            "legalPeriodical": {
              "id": "33333333-1fd3-4fb8-bc1d-9751ad192665",
              "title": "periodikum title 1",
              "subtitle": "periodikum subtitle 1",
              "abbreviation": "p.abbrev.1"
            }
          },
          {
            "id": "22222222-1fd3-4fb8-bc1d-9751ad192665",
            "citation": "zitatstelle 2",
            "legalPeriodical": {
              "id": "44444444-1fd3-4fb8-bc1d-9751ad192665",
              "title": "periodikum title 2",
              "subtitle": "periodikum subtitle 2",
              "abbreviation": "p.abbrev.2"
            }
          }
        ]
      }
      """
    );
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);
    DocumentationUnitIndexEntity documentationUnitIndexEntity = new DocumentationUnitIndexEntity();
    documentationUnitIndexEntity.setDocumentationUnit(documentationUnitEntity);
    documentationUnitEntity.setDocumentationUnitIndex(documentationUnitIndexEntity);

    documentationUnitIndexEntity.setLangueberschrift("Sample Document Title 1");
    documentationUnitIndexEntity.setFundstellen(
      "p.abbrev.1 zitatstelle 1%sp.abbrev.2 zitatstelle 2".formatted(ENTRY_SEPARATOR)
    );
    documentationUnitIndexEntity.setZitierdaten("2011-11-11");
    entityManager.persistAndFlush(documentationUnitIndexEntity);

    // when
    var documentationUnitOverviewElements =
      documentationUnitPersistenceService.findDocumentationUnitOverviewElements(
        new DocumentationUnitQuery(
          null,
          null,
          null,
          null,
          new QueryOptions(0, 10, "id", Sort.Direction.ASC, false)
        )
      );

    // then
    assertThat(documentationUnitOverviewElements)
      .extracting(Page::content)
      .asInstanceOf(InstanceOfAssertFactories.list(DocumentationUnitOverviewElement.class))
      .filteredOn(documentationUnitOverviewElement ->
        documentationUnitOverviewElement.documentNumber().equals("KSNR2025100001")
      )
      .singleElement()
      .extracting(
        DocumentationUnitOverviewElement::zitierdaten,
        DocumentationUnitOverviewElement::langueberschrift,
        DocumentationUnitOverviewElement::fundstellen
      )
      .containsExactly(
        List.of("2011-11-11"),
        "Sample Document Title 1",
        List.of("p.abbrev.1 zitatstelle 1", "p.abbrev.2 zitatstelle 2")
      );
  }

  @Test
  void findDocumentationUnitOverviewElements_withoutFundstellen() {
    // given
    var documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR2025100002");
    documentationUnitEntity.setJson(
      """
      {
        "id": "11111111-1657-4085-ae2a-993a04c27f6b",
        "documentNumber": "KSNR2025100002",
        "zitierdatum": "2011-11-11",
        "langueberschrift": "Sample Document Title 1"
      }
      """
    );
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);
    DocumentationUnitIndexEntity documentationUnitIndexEntity = new DocumentationUnitIndexEntity();
    documentationUnitIndexEntity.setDocumentationUnit(documentationUnitEntity);
    documentationUnitIndexEntity.setLangueberschrift("Sample Document Title 1");
    documentationUnitIndexEntity.setZitierdaten("2011-11-11");
    documentationUnitEntity.setDocumentationUnitIndex(documentationUnitIndexEntity);
    entityManager.persistAndFlush(documentationUnitIndexEntity);

    // when
    var documentationUnitOverviewElements =
      documentationUnitPersistenceService.findDocumentationUnitOverviewElements(
        new DocumentationUnitQuery(
          null,
          null,
          null,
          null,
          new QueryOptions(0, 10, "id", Sort.Direction.ASC, false)
        )
      );

    // then
    assertThat(documentationUnitOverviewElements)
      .extracting(Page::content)
      .asInstanceOf(InstanceOfAssertFactories.list(DocumentationUnitOverviewElement.class))
      .filteredOn(documentationUnitOverviewElement ->
        documentationUnitOverviewElement.documentNumber().equals("KSNR2025100002")
      )
      .singleElement()
      .extracting(
        DocumentationUnitOverviewElement::zitierdaten,
        DocumentationUnitOverviewElement::langueberschrift,
        DocumentationUnitOverviewElement::fundstellen
      )
      .containsExactly(List.of("2011-11-11"), "Sample Document Title 1", List.of());
  }

  @Test
  void findDocumentationUnitOverviewElements_byDocumentNumber() {
    // given
    createTestUnit("KSNR00001", "Title A", "Fundstelle A", "2025-01-01");
    createTestUnit("KSNR00002", "Title B", "Fundstelle B", "2025-01-02");

    // when
    var query = new DocumentationUnitQuery(
      "KSNR00001",
      null,
      null,
      null,
      new QueryOptions(0, 10, "id", Sort.Direction.ASC, true)
    );
    var result = documentationUnitPersistenceService.findDocumentationUnitOverviewElements(query);

    // then
    assertThat(result.content())
      .hasSize(1)
      .singleElement()
      .extracting(DocumentationUnitOverviewElement::documentNumber)
      .isEqualTo("KSNR00001");
  }

  @Test
  void findDocumentationUnitOverviewElements_byLangueberschrift() {
    // given
    createTestUnit("KSNR00003", "A very specific title", "Fundstelle C", "2025-01-03");
    createTestUnit("KSNR00004", "Another title", "Fundstelle D", "2025-01-04");

    // when
    var query = new DocumentationUnitQuery(
      null,
      "specific",
      null,
      null,
      new QueryOptions(0, 10, "id", Sort.Direction.ASC, true)
    );
    var result = documentationUnitPersistenceService.findDocumentationUnitOverviewElements(query);

    // then
    assertThat(result.content())
      .hasSize(1)
      .singleElement()
      .extracting(DocumentationUnitOverviewElement::langueberschrift)
      .isEqualTo("A very specific title");
  }

  @Test
  void findDocumentationUnitOverviewElements_byFundstellen() {
    // given
    createTestUnit("KSNR00005", "Title E", "Fundstelle Alpha", "2025-01-05");
    createTestUnit("KSNR00006", "Title F", "Fundstelle Beta", "2025-01-06");

    // when
    var query = new DocumentationUnitQuery(
      null,
      null,
      "lph",
      null,
      new QueryOptions(0, 10, "id", Sort.Direction.ASC, true)
    );
    var result = documentationUnitPersistenceService.findDocumentationUnitOverviewElements(query);

    // then
    assertThat(result.content())
      .hasSize(1)
      .singleElement()
      .extracting(DocumentationUnitOverviewElement::fundstellen)
      .isEqualTo(List.of("Fundstelle Alpha"));
  }

  @Test
  void findDocumentationUnitOverviewElements_byZitierdaten() {
    // given
    createTestUnit("KSNR00007", "Title G", "Fundstelle G", "2025-01-07");
    createTestUnit("KSNR00008", "Title H", "Fundstelle H", "2025-01-08");

    // when
    var query = new DocumentationUnitQuery(
      null,
      null,
      null,
      "2025-01-07",
      new QueryOptions(0, 10, "id", Sort.Direction.ASC, true)
    );
    var result = documentationUnitPersistenceService.findDocumentationUnitOverviewElements(query);

    // then
    assertThat(result.content())
      .hasSize(1)
      .singleElement()
      .extracting(DocumentationUnitOverviewElement::zitierdaten)
      .isEqualTo(List.of("2025-01-07"));
  }

  @Test
  void indexByDocumentationUnit_xml() {
    // given
    String xml = TestFile.readFileToString("ldml-example.akn.xml");
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR9999999999");
    documentationUnitEntity.setXml(xml);
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);

    // when
    documentationUnitPersistenceService.indexAll();

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(
        "1. Bekanntmachung zum XML-Testen in NeuRIS VwV",
        "Das Periodikum 2021, Seite 15",
        "2025-05-05%s2025-06-01".formatted(ENTRY_SEPARATOR)
      );
  }

  @Test
  void indexByDocumentationUnit_json() {
    // given
    String json = TestFile.readFileToString("json-example.json");
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR777777777");
    documentationUnitEntity.setJson(json);
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);

    // when
    documentationUnitPersistenceService.indexAll();

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(
        "1. Bekanntmachung zum XML-Testen in NeuRIS VwV",
        "Das Periodikum 2021, Seite 15",
        "2025-05-05%s2025-06-01".formatted(ENTRY_SEPARATOR)
      );
  }

  @Test
  void indexByDocumentationUnit_jsonNotValid() {
    // given
    var documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber(String.format("KSNR%s100003", Year.now()));
    documentationUnitEntity.setJson(
      """
      {
        "id": "11111111-1657-4085-ae2a-993a04c27f6b",
        "documentNumber": "KSNR000004711",
        [] ooops
      }
      """
    );
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);

    // when
    documentationUnitPersistenceService.indexAll();

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(null, null, null);
  }

  @Test
  void indexByDocumentationUnit_jsonAndXml() {
    // given
    String json = TestFile.readFileToString("json-example.json");
    String xml = TestFile.readFileToString("ldml-example.akn.xml");
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR555555555");
    documentationUnitEntity.setJson(json);
    documentationUnitEntity.setXml(xml);
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);

    // when
    documentationUnitPersistenceService.indexAll();

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(
        "1. Bekanntmachung zum XML-Testen in NeuRIS VwV",
        "Das Periodikum 2021, Seite 15",
        "2025-05-05%s2025-06-01".formatted(ENTRY_SEPARATOR)
      );
  }

  @Test
  void indexByDocumentationUnit_jsonAndXmlAreNull() {
    // given
    DocumentationUnitEntity documentationUnitEntity = new DocumentationUnitEntity();
    documentationUnitEntity.setDocumentNumber("KSNR333333333");
    documentationUnitEntity = entityManager.persistFlushFind(documentationUnitEntity);

    // when
    documentationUnitPersistenceService.indexAll();

    // then
    TypedQuery<DocumentationUnitIndexEntity> query = createTypedQuery(documentationUnitEntity);
    assertThat(query.getResultList())
      .singleElement()
      .extracting(
        DocumentationUnitIndexEntity::getLangueberschrift,
        DocumentationUnitIndexEntity::getFundstellen,
        DocumentationUnitIndexEntity::getZitierdaten
      )
      .containsExactly(null, null, null);
  }

  private TypedQuery<DocumentationUnitIndexEntity> createTypedQuery(
    DocumentationUnitEntity documentationUnitEntity
  ) {
    TypedQuery<DocumentationUnitIndexEntity> query = entityManager
      .getEntityManager()
      .createQuery(
        "from DocumentationUnitIndexEntity where documentationUnit = :documentationUnit",
        DocumentationUnitIndexEntity.class
      );
    query.setParameter("documentationUnit", documentationUnitEntity);
    return query;
  }
}

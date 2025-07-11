package de.bund.digitalservice.ris.adm_vwv.adapter.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import io.hypersistence.utils.hibernate.query.SQLExtractor;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class DocumentationUnitSpecificationIntegrationTest {

  @Autowired
  private TestEntityManager entityManager;

  @Test
  @DisplayName("toPredicate with no parameters should not add a filtering where clause")
  void toPredicate_withNoParameters() {
    // given
    DocumentUnitSpecification specification = new DocumentUnitSpecification(null, null, null, null);
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = specification.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql).doesNotContain("like");
  }

  @Test
  @DisplayName("toPredicate with documentNumber should add like clause and no join")
  void toPredicate_withDocumentNumberOnly() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification("123", null, null, null);
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql).contains("where lower(due1_0.document_number) like ?").doesNotContain("join");
  }

  @Test
  @DisplayName("toPredicate with langueberschrift should add like clause and a left join")
  void toPredicate_withLangueberschriftOnly() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification(
      null,
      "ueberschriftXY",
      null,
      null
    );
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql)
      .contains("left join documentation_unit_index")
      .contains("where lower(dui1_0.langueberschrift) like ?");
  }

  @Test
  @DisplayName("toPredicate with fundstellen should add like clause and a left join")
  void toPredicate_withFundstellenOnly() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification(
      null,
      null,
      "fundstelleXY",
      null
    );
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql)
      .contains("left join documentation_unit_index")
      .contains("where lower(dui1_0.fundstellen) like ?");
  }

  @Test
  @DisplayName("toPredicate with zitierdaten should add like clause and a left join")
  void toPredicate_withZitierdatenOnly() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification(null, null, null, "zdXY");
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql)
      .contains("left join documentation_unit_index")
      .contains("where lower(dui1_0.zitierdaten) like ?");
  }

  @Test
  @DisplayName("toPredicate with all parameters should add multiple like clauses and a left join")
  void toPredicate_withAllParameters() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification("123", "luXX", "fsXY", "zdXZ");
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql)
      .contains("left join documentation_unit_index")
      .contains("lower(due1_0.document_number) like ?")
      .contains("and lower(dui1_0.fundstellen) like ?")
      .contains("and lower(dui1_0.langueberschrift) like ?")
      .contains("and lower(dui1_0.zitierdaten) like ?");
  }

  @Test
  @DisplayName(
    "toPredicate with all index parameters should add multiple like clauses and one left join"
  )
  void toPredicate_withAllIndexParameters() {
    // given
    DocumentUnitSpecification spec = new DocumentUnitSpecification(null, "luXX", "fsXY", "zdXZ");
    CriteriaBuilder cb = entityManager.getEntityManager().getCriteriaBuilder();
    CriteriaQuery<DocumentationUnitEntity> query = cb.createQuery(DocumentationUnitEntity.class);
    Root<DocumentationUnitEntity> root = query.from(DocumentationUnitEntity.class);

    // when
    Predicate predicate = spec.toPredicate(root, query, cb);
    String sql = SQLExtractor.from(
      entityManager.getEntityManager().createQuery(query.where(predicate))
    );

    // then
    assertThat(sql)
      .contains("left join documentation_unit_index")
      .contains("where lower(dui1_0.fundstellen) like ?")
      .contains("and lower(dui1_0.langueberschrift) like ?")
      .contains("and lower(dui1_0.zitierdaten) like ?")
      .doesNotContain("d1_0.document_number");
  }
}

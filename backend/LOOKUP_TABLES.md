# How to use the `lookup_tables` schema

## 1. Prerequisites

The NeuRIS wide `lookup_tables` schema must be set up in the cluster with the tables and data you want to select.
The database schema of your project and the lookup tables schema _must_ be inside the same database.
The database schema of your project must be setup in the cluster as well.

It is assumed that your project uses Spring Boot with Flyway, build with Gradle (Kotlin).

## 2. Prepare local setup for use of lookup tables schema

Next chapters describe step by step how to set up a local environment, also for integration testing.
If your application already has a local setup and you want only to add a new lookup table, continue with chapter 4.

### 2.1. Use docker compose support of Spring Boot

It is useful to include [Spring Docker Compose Support](https://docs.spring.io/spring-boot/how-to/docker-compose.html).
Nevertheless, you can create your own docker file if needed. For features and limitations on Spring's Docker
Compose Support see this [Spring Blog Post](https://spring.io/blog/2023/06/21/docker-compose-support-in-spring-boot-3-1).
To create an example you can create an empty application on [Spring Initializer](https://start.spring.io/) with
dependencies: Docker Compose Support, Spring Data JPA, PostgreSQL Driver.

Add to application `build.gradle.kts` the dependency:
```kotlin
  developmentOnly("org.springframework.boot:spring-boot-docker-compose")
```

Include a docker compose file (`compose.yaml` or `docker-compose.yaml`):

```yaml
name: 'application-backend-container'
services:
  postgres:
    container_name: 'application-postgres'
    image: 'postgres:14-alpine'
    environment:
      - 'POSTGRES_DB=mydatabase'
      - 'POSTGRES_PASSWORD=test'
      - 'POSTGRES_USER=test'
    ports:
      - '5432:5432'
    volumes:
      - ./docker-initialization:/docker-entrypoint-initdb.d/
```

Create an empty directory `docker-initialization` on the project root. Now if you start the project a docker container
is start up automatically. Note that the above used properties of database, user, and password overriding
corresponding properties of an `application.yaml` file.

### 2.2 Create initialization scripts

To simulate there is a secondary schema called `lookup_tables` locally initialization scripts are needed to create that
schema before the application is running the flyway migrations. You can put any .sh or .sql files you like
under the directory `docker-initialization`. Make sure, that
- the schema `lookup_tables` is created
- needed tables in schema `lookup_tables` are created (needed are all tables which are used in flyway migration in your application)
- that the application user have read access to the `lookup tables` schema
- [See ris-adm-vwv-backend for an example](https://github.com/digitalservicebund/ris-adm-vwv/tree/e0ec45b4984406bb14b38b05be56e1594ed02db9/backend/docker-initialization)

Test the initialization scripts by starting the docker container or the application directly. Note, that it is needed
to remove the docker volume if you want to change the initialization scripts.

### 2.3. Setup integration tests

There are two possible ways to set up integration tests. Integration tests in sense of this chapter are annotated
with `@SpringBootTest` and starting the application completely with database and flyway migrations.

#### 2.3.1. Way I: Integration tests with docker compose support

This way uses the same setup as when starting the application locally. To make Docker Compose Support available during
tests you have to change the Gradle dependency as follows:
```kotlin
testAndDevelopmentOnly("org.springframework.boot:spring-boot-docker-compose")
```

The compose support for tests needs to be enabled by configuration. Furthermore, it is strongly recommended to
configure removing the docker volume on stopping. Add a yaml file in `src/test/resources`
called `application-test.yaml`:

```yaml
spring:
  docker:
    compose:
      skip:
        in-tests: false
      stop:
        arguments: -v
        command: down
```

Now the tests need to be run with profile `test` due to the name of the yaml file. It is possible to activate that
profile automatically like in this integration test file by annotation `@ActiveProfiles`:

```java
@SpringBootTest
@ActiveProfiles("test")
class ApplicationTests {

  @Test
  void contextLoads() {}
}
```

If you can successfully run this test, your setup for integration tests is complete.

#### 2.3.2. Way II: Integration tests with Testcontainers

To use Testcontainers you have to add the initialization script per Java Configuration.

```java
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

  @Bean
  @ServiceConnection
  PostgreSQLContainer<?> postgresContainer() {
    return new PostgreSQLContainer<>(DockerImageName.parse("postgres:14-alpine"))
      .withInitScript("init.sql");
  }

}

```

The `init.sql` script needs to be available on classpath, e.g. under the folder `src/test/resources`.

## 3. Grant read access to lookup tables schema for your schema

To be able to include a table from `lookup_tables` schema your application database user needs read access.

As example, the `document_types` lookup table have to be included to your project. Your project uses the database
schema `yours` whereas the `document_types` table is in database schema `lookup_tables`.
First of all your database user have to give read access to the `lookup_tables` schema.
This can be done by [adding a function call](https://github.com/digitalservicebund/neuris-infra/blob/main/terraform/bootstrap-database.sh)
in `bootstrap-database.sh` in GitHub Repository `neuris-infra`:
```bash
grant_read_access "${DATABASE}" "lookup_tables" "${YOURS_USER_NAME}" "${LOOKUP_TABLES_USER_NAME}"
```
The environment variable `YOURS_USER_NAME` points to the username of your database schema.

## 4. Include new lookup table to your application

This chapter describes the inclusion of a lookup table if the application has already read access to the
`lookup_tables` schema.

### 4.1. Add flyway migration

To access a table from another schema than your applications schema, it is recommended to add a view. With the view
it is easier to access the data with Spring Data JPA; no configuration for an secondary data source is needed.
Example migration script:
```sql
-- View uses foreign schema "lookup_tables", therefore it is repeatable.
CREATE OR REPLACE
VIEW document_types_view
AS
SELECT id, abbreviation, name
FROM lookup_tables.document_types;
```

Instead of a fixed migration version, you can use a [repeatable migration](https://github.com/flyway/flywaydb.org/blob/gh-pages/documentation/concepts/migrations.md#repeatable-migrations) with prefix `R`.
That way the migration script is executed every time it changes.

Based on your needs, you can specify the select with more or less columns, filtering, and order directives.

### 4.2. Add a JPA entity and repository for the view

The next step is to create a JPA entity for the view created in chapter 2.2.:
```java
@Entity
@Table(name = "document_types_view")
@Immutable
public class DocumentTypeEntity {

  @Id
  private UUID id;

  private String abbreviation;

  private String name;
}
```
 Note, that due to JPA conventions there must be field annotated with `@Id`. We can mark the entity with
`@Immutable` annotation.

Next, we need to add a Spring Data JPA repository:

```java
interface DocumentTypesRepository extends JpaRepository<DocumentTypeEntity, UUID> {}
```

Now the application can access the document types view by the `DocumentTypesRepository`. Note that all modifying
methods like `save()`, `delete()` etc. can not be used.

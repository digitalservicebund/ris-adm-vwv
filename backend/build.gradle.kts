import com.diffplug.spotless.LineEnding
import com.github.jk1.license.filter.LicenseBundleNormalizer

plugins {
  java
  id("org.springframework.boot") version "4.0.0"
  id("io.spring.dependency-management") version "1.1.7"
  id("jacoco")
  id("org.sonarqube") version "7.1.0.6387"
  id("com.github.jk1.dependency-license-report") version "3.0.1"
  id("com.diffplug.spotless") version "8.1.0"
  id("checkstyle")
  id("io.freefair.lombok") version "9.1.0"
}

group = "de.bund.digitalservice"
version = "0.0.1-SNAPSHOT"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(25)
  }
}

configurations {
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  mavenCentral()
  // Needed for RC versions of Spring Cloud
  maven { url = uri("https://repo.spring.io/milestone") }
}

extra["springCloudVersion"] = "2025.1.0"

val springdocVersion = "3.0.0"
val sentryVersion = "8.27.1"
val hypersistenceVersion = "3.12.0"
val postgresVersion = "42.7.8"
val commonsTextVersion = "1.14.0"
val localStackVersion = "1.21.3"
val awsVersion = "2.33.0"
val jsoupVersion = "1.21.2"
val commonsLang3 = "3.20.0"

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-webmvc") {
  }
  implementation("org.springframework.cloud:spring-cloud-starter-kubernetes-client-config") {
    // CVE-2024-7254
    exclude("com.google.protobuf", "protobuf-java")

    // CVE-2023-51775
    exclude("org.bitbucket.b_c", "jose4j")

    // CVE‐2025‐8916
    exclude("org.bouncycastle", " bcpkix-jdk18on")
  }
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-flyway")
  implementation("org.flywaydb:flyway-database-postgresql")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

  implementation("com.google.protobuf:protobuf-java:4.33.1")
  implementation("org.bitbucket.b_c:jose4j:0.9.6")
  implementation("org.bouncycastle:bcpkix-jdk18on:1.83")
  implementation("org.apache.commons:commons-lang3:$commonsLang3")
  implementation("org.apache.commons:commons-text:$commonsTextVersion")
  implementation("jakarta.xml.bind:jakarta.xml.bind-api")
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")
  implementation("io.sentry:sentry-spring-boot-4:$sentryVersion")
  implementation("io.sentry:sentry-logback:$sentryVersion")
  implementation(platform("software.amazon.awssdk:bom:$awsVersion"))

  implementation("software.amazon.awssdk:s3")
  implementation("org.jsoup:jsoup:$jsoupVersion")
  compileOnly("org.projectlombok:lombok")
  testAndDevelopmentOnly("org.springframework.boot:spring-boot-docker-compose")

  // no-auto-pin-removal CVE-2025-49146
  runtimeOnly("org.postgresql:postgresql:$postgresVersion")
  annotationProcessor("org.projectlombok:lombok")
  testImplementation("org.springframework.boot:spring-boot-starter-actuator-test")
  testImplementation("org.springframework.boot:spring-boot-starter-data-jpa-test")
  testImplementation("org.springframework.boot:spring-boot-starter-flyway-test")
  testImplementation("org.springframework.boot:spring-boot-starter-security-oauth2-resource-server-test")
  testImplementation("org.springframework.boot:spring-boot-starter-security-test")
  testImplementation("org.springframework.boot:spring-boot-starter-validation-test")
  testImplementation("org.springframework.boot:spring-boot-starter-webmvc-test")
  testImplementation("org.springframework.boot:spring-boot-testcontainers")
  testImplementation("org.testcontainers:testcontainers-junit-jupiter")
  testImplementation("org.testcontainers:testcontainers-postgresql")
  testImplementation("io.hypersistence:hypersistence-utils-hibernate-71:$hypersistenceVersion")
  testImplementation("org.testcontainers:localstack:$localStackVersion")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

dependencyManagement {
  imports {
    mavenBom("org.springframework.cloud:spring-cloud-dependencies:${property("springCloudVersion")}")
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}

jacoco {
  toolVersion = "0.8.14"
}

tasks.jacocoTestReport {
  //    dependsOn(tasks.test)

  // Jacoco hooks into all tasks of type: Test automatically, but results for each of these
  // tasks are kept separately and are not combined out of the box. we want to gather
  // coverage of our unit and integration tests as a single report!
  executionData.setFrom(
    files(
      fileTree(project.layout.buildDirectory) {
        include("jacoco/*.exec")
      },
    ),
  )
  reports {
    xml.required = true
    html.required = true
  }
  dependsOn("test") // All tests are required to run before generating a report.
}

tasks.getByName("sonar") {
  dependsOn("jacocoTestReport")
}

sonar {
  // NOTE: sonarqube picks up combined coverage correctly without further configuration from:
  // build/reports/jacoco/test/jacocoTestReport.xml
  properties {
    // we don't use "sonar-project.properties", but define the properties here
    property("sonar.projectKey", "ris-adm-vwv-backend")
    property("sonar.organization", "digitalservicebund")
    property("sonar.host.url", "https://sonarcloud.io")
    property("sonar.token", System.getenv("SONAR_TOKEN"))
    // we usually don't test config files
    property("sonar.coverage.exclusions", "**/Application.java, **/config/**")
  }
}

tasks.bootBuildImage {
  val containerImageRef = System.getenv("IMAGE_REF") ?: "ghcr.io/digitalservicebund/${rootProject.name}:latest"
  val containerRegistry = System.getenv("CONTAINER_REGISTRY") ?: "ghcr.io"

  imageName.set(containerImageRef)
  builder.set("paketobuildpacks/builder-noble-java-tiny:latest")
  publish.set(false)

  docker {
    publishRegistry {
      username.set(System.getenv("CONTAINER_REGISTRY_USER") ?: "")
      password.set(System.getenv("CONTAINER_REGISTRY_PASSWORD") ?: "")
      url.set("https://$containerRegistry")
    }
  }
}

licenseReport {
// If there's a new dependency with a yet unknown license causing this task to fail
// the license(s) will be listed in build/reports/dependency-license/dependencies-without-allowed-license.json
  allowedLicensesFile = File("$projectDir/../allowed-licenses.json")
  filters =
    arrayOf(
      // With second arg true we get the default transformations:
      // https://github.com/jk1/Gradle-License-Report/blob/7cf695c38126b63ef9e907345adab84dfa92ea0e/src/main/resources/default-license-normalizer-bundle.json
      LicenseBundleNormalizer(null as String?, true),
    )
}

spotless {
  kotlin {
    // Note that changes to the ktlint() default settings are done in .editorconfig
    ktlint("1.4.1")
  }

  kotlinGradle {
    ktlint("1.4.1")
  }

  java {
    removeUnusedImports()
    toggleOffOn()
    prettier(
      mapOf(
        "prettier" to "3.5.2",
        "prettier-plugin-java" to "2.6.7",
      ),
    ).config(
      mapOf(
        "parser" to "java",
        "printWidth" to 100,
        "plugins" to listOf("prettier-plugin-java"),
      ),
    )
  }

  format("misc") {
    target(
      ".gitattributes",
      ".gitignore",
      "*.md",
    )
    prettier(
      mapOf(
        "prettier" to "2.6.1",
        "prettier-plugin-sh" to "0.7.1",
        "prettier-plugin-properties" to "0.1.0",
      ),
    ).config(mapOf("keySeparator" to "="))
  }
  if (System.getProperty("os.name", "undefined").contains("Windows")) {
    lineEndings = LineEnding.UNIX
  }
}

tasks.named<Checkstyle>("checkstyleMain") {
  source = sourceSets["main"].allJava
  configFile = rootProject.file("checkstyle/config-main.xml")
}

tasks.named<Checkstyle>("checkstyleTest") {
  source = sourceSets["test"].allJava
  configFile = rootProject.file("checkstyle/config-test.xml")
}

lombok {
  version = "1.18.40"
}

tasks {
  javadoc {
    isFailOnError = false
  }
}

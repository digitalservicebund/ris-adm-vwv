import com.diffplug.spotless.LineEnding
import com.github.jk1.license.filter.LicenseBundleNormalizer

plugins {
  java
  id("org.springframework.boot") version "3.4.3"
  id("io.spring.dependency-management") version "1.1.7"
  id("jacoco")
  id("org.sonarqube") version "6.0.1.5171"
  id("com.github.jk1.dependency-license-report") version "2.9"
  id("com.diffplug.spotless") version "7.0.2"
}

group = "de.bund.digitalservice"
version = "0.0.1-SNAPSHOT"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(23)
  }
}

configurations {
  compileOnly {
    extendsFrom(configurations.annotationProcessor.get())
  }
}

repositories {
  mavenCentral()
}

val kubernetesConfigVersion = "3.2.0"
val protobufVersion = "4.30.0"
val joseVersion = "0.9.6"
val okioVersion = "3.10.2"
val springdocVersion = "2.8.5"
val sentryVersion = "8.3.0"
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.cloud:spring-cloud-starter-kubernetes-client-config:$kubernetesConfigVersion") {
    exclude("com.google.protobuf", "protobuf-java")

    // https://github.com/digitalservicebund/ris-adm-vwv/security/code-scanning/12
    exclude("org.bitbucket.b_c", "jose4j")

    // https://github.com/digitalservicebund/ris-adm-vwv/security/code-scanning/11
    exclude("com.squareup.okio", "okio-jvm")
  }
  implementation("com.google.protobuf:protobuf-java:$protobufVersion")
  implementation("org.bitbucket.b_c:jose4j:$joseVersion")
  implementation("com.squareup.okio:okio-jvm:$okioVersion")
  implementation("org.springframework.retry:spring-retry")
  implementation("org.flywaydb:flyway-core")
  implementation("org.flywaydb:flyway-database-postgresql")
  implementation("org.springframework.session:spring-session-core")
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")
  implementation("io.sentry:sentry-spring-boot-starter-jakarta:$sentryVersion")
  implementation("io.sentry:sentry-logback:$sentryVersion")
  compileOnly("org.projectlombok:lombok")
  developmentOnly("org.springframework.boot:spring-boot-docker-compose")
  runtimeOnly("org.postgresql:postgresql")
  annotationProcessor("org.projectlombok:lombok")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.boot:spring-boot-testcontainers")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("org.testcontainers:junit-jupiter")
  testImplementation("org.testcontainers:postgresql")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.withType<Test> {
  useJUnitPlatform()
}

jacoco {
  toolVersion = "0.8.12"
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
    property("sonar.coverage.exclusions", "**/Application.java")
  }
}

tasks.bootBuildImage {
  val containerImageRef = System.getenv("IMAGE_REF") ?: "ghcr.io/digitalservicebund/${rootProject.name}:latest"
  val containerRegistry = System.getenv("CONTAINER_REGISTRY") ?: "ghcr.io"

  imageName.set(containerImageRef)
  builder.set("paketobuildpacks/builder-noble-java-tiny:latest")
  publish.set(false)
  runImage.set("cgr.dev/chainguard/jre@sha256:6207f817070fae80779cdcf5ab3d24880e8c4fe19a31af24b3b5e850eda3d80e")

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

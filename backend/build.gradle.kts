import com.diffplug.spotless.LineEnding
import com.github.jk1.license.filter.LicenseBundleNormalizer
import io.franzbecker.gradle.lombok.task.DelombokTask

plugins {
  java
  id("org.springframework.boot") version "3.5.3"
  id("io.spring.dependency-management") version "1.1.7"
  id("jacoco")
  id("org.sonarqube") version "6.2.0.5505"
  id("com.github.jk1.dependency-license-report") version "2.9"
  id("com.diffplug.spotless") version "7.1.0"
  id("checkstyle")
  id("io.franzbecker.gradle-lombok") version "5.0.0"
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
  // Needed for RC versions of Spring Cloud
  maven { url = uri("https://repo.spring.io/milestone") }
}

extra["springCloudVersion"] = "2025.0.0-RC1"

val springdocVersion = "2.8.9"
val sentryVersion = "8.17.0"
val hypersistenceVersion = "3.10.2"
val postgresVersion = "42.7.7"
dependencies {
  implementation("org.springframework.boot:spring-boot-starter-actuator")
  implementation("org.springframework.boot:spring-boot-starter-data-jpa")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-validation")
  implementation("org.springframework.boot:spring-boot-starter-web") {
  }
  implementation("org.springframework.cloud:spring-cloud-starter-kubernetes-client-config") {
    // CVE-2024-7254
    exclude("com.google.protobuf", "protobuf-java")

    // CVE-2023-51775
    exclude("org.bitbucket.b_c", "jose4j")
  }
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-oauth2-resource-server")

  implementation("com.google.protobuf:protobuf-java:4.31.1")
  implementation("org.bitbucket.b_c:jose4j:0.9.6")
  implementation("org.springframework.retry:spring-retry")
  implementation("org.flywaydb:flyway-core")
  implementation("org.flywaydb:flyway-database-postgresql")
  implementation("org.springframework.session:spring-session-core")
  implementation("jakarta.xml.bind:jakarta.xml.bind-api")
  implementation("org.springdoc:springdoc-openapi-starter-webmvc-ui:$springdocVersion")
  implementation("io.sentry:sentry-spring-boot-starter-jakarta:$sentryVersion")
  implementation("io.sentry:sentry-logback:$sentryVersion")
  compileOnly("org.projectlombok:lombok")
  testAndDevelopmentOnly("org.springframework.boot:spring-boot-docker-compose")

  // no-auto-pin-removal CVE-2025-49146
  runtimeOnly("org.postgresql:postgresql:$postgresVersion")
  annotationProcessor("org.projectlombok:lombok")
  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.boot:spring-boot-testcontainers")
  testImplementation("org.springframework.security:spring-security-test")
  testImplementation("org.testcontainers:junit-jupiter")
  testImplementation("org.testcontainers:postgresql")
  testImplementation("io.hypersistence:hypersistence-utils-hibernate-63:$hypersistenceVersion")
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
  runImage.set("cgr.dev/chainguard/jre@sha256:40baab93abc011b4fd78161e6c4a6c922b14d5f8e831c67f312e5ca065100964")

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
  version = "1.18.36"
}

tasks {
  val delombok by registering(DelombokTask::class) {
    dependsOn(compileJava)
    mainClass.set("lombok.launch.Main")
    val outputDir by extra { file("${project.layout.buildDirectory.get()}/delombok") }
    outputs.dir(outputDir)
    sourceSets["main"].java.srcDirs.forEach {
      inputs.dir(it)
      args(it, "-d", outputDir)
    }
    doFirst {
      outputDir.delete()
    }
  }

  javadoc {
    dependsOn(delombok)
    val outputDir: File by delombok.get().extra
    source = fileTree(outputDir)
    isFailOnError = false
  }
}

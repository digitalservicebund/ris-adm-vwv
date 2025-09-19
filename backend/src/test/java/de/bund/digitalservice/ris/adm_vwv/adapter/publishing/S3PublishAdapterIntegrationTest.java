package de.bund.digitalservice.ris.adm_vwv.adapter.publishing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;

import de.bund.digitalservice.ris.adm_vwv.application.ValidationFailedException;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.localstack.LocalStackContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import org.xml.sax.SAXParseException;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

/**
 * Integration test for the composite publisher logic.
 * This test uses Testcontainers and LocalStack to spin up a real S3-compatible environment
 * and verifies that the composite publisher correctly routes requests to the appropriate bean.
 */
@Testcontainers
// This property is needed because our main AwsConfig provides a mock S3Client bean
// for the "test" profile, but this test needs to override it with a real one
// from the inner @TestConfiguration. This property allows that override to happen.
@SpringBootTest(properties = "spring.main.allow-bean-definition-overriding=true")
@ActiveProfiles("test")
class S3PublishAdapterIntegrationTest {

  private static final String FIRST_BUCKET_NAME = "test-bucket-1";
  private static final String FIRST_PUBLISHER_NAME = "privateBsgPublisher";
  private static final String SECOND_BUCKET_NAME = "test-bucket-2";
  private static final String SECOND_PUBLISHER_NAME = "secondTestPublisher";
  private static final String FIRST_DATATYPE = "first-datatype";
  private static final String SECOND_DATATYPE = "second-datatype";
  private static final String CHANGELOG_DIR = "changelogs/";

  @Container
  static LocalStackContainer localStack = new LocalStackContainer(
    DockerImageName.parse("localstack/localstack:4.7.0")
  ).withServices(LocalStackContainer.Service.S3);

  /**
   * Provides two S3Client beans to test the composite logic.
   */
  @TestConfiguration
  static class S3TestConfig {

    @Bean
    public XmlValidator xmlValidator() {
      return mock(XmlValidator.class);
    }

    @Bean("privateBsgS3Client")
    @Primary
    public S3Client s3Client() {
      return S3Client.builder()
        .endpointOverride(localStack.getEndpointOverride(LocalStackContainer.Service.S3))
        .credentialsProvider(
          StaticCredentialsProvider.create(
            AwsBasicCredentials.create(localStack.getAccessKey(), localStack.getSecretKey())
          )
        )
        .region(Region.of(localStack.getRegion()))
        .forcePathStyle(true)
        .build();
    }

    @Bean(FIRST_PUBLISHER_NAME)
    public PublishPort firstTestPublisher(S3Client s3Client, XmlValidator xmlValidator) {
      return new S3PublishAdapter(
        s3Client,
        xmlValidator,
        FIRST_BUCKET_NAME,
        FIRST_DATATYPE,
        FIRST_PUBLISHER_NAME
      );
    }

    @Bean(SECOND_PUBLISHER_NAME)
    public PublishPort secondTestPublisher(S3Client s3Client, XmlValidator xmlValidator) {
      return new S3PublishAdapter(
        s3Client,
        xmlValidator,
        SECOND_BUCKET_NAME,
        SECOND_DATATYPE,
        SECOND_PUBLISHER_NAME
      );
    }
  }

  @Autowired
  private PublishPort publishPort;

  @Autowired
  private S3Client s3Client;

  @Autowired
  private XmlValidator xmlValidator;

  @DynamicPropertySource
  static void overrideProperties(DynamicPropertyRegistry registry) {
    registry.add("otc.private-bsg-client.bucket-name", () -> FIRST_BUCKET_NAME);
  }

  @BeforeEach
  void setUp() {
    createBucket(FIRST_BUCKET_NAME);
    createBucket(SECOND_BUCKET_NAME);
  }

  @AfterEach
  void tearDown() {
    cleanupBucket(FIRST_BUCKET_NAME);
    cleanupBucket(SECOND_BUCKET_NAME);
  }

  private void cleanupBucket(String bucketName) {
    List<S3Object> objects = listObjectsInDirectory(bucketName, "");
    if (!objects.isEmpty()) {
      List<ObjectIdentifier> toDelete = objects
        .stream()
        .map(o -> ObjectIdentifier.builder().key(o.key()).build())
        .toList();
      DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
        .bucket(bucketName)
        .delete(Delete.builder().objects(toDelete).build())
        .build();
      s3Client.deleteObjects(deleteRequest);
    }
  }

  private void createBucket(String bucketName) {
    s3Client.createBucket(b -> b.bucket(bucketName));
  }

  @Test
  void publish_shouldRouteToFirstPublisherAndUploadToCorrectBucket() {
    // given
    String docNumber = "doc-abc-456";
    String xmlContent = "<test-data>This is a test</test-data>";
    var options = new PublishPort.Options(docNumber, xmlContent, FIRST_PUBLISHER_NAME);

    // when
    publishPort.publish(options);

    // then
    // Verify the file exists in the FIRST bucket
    GetObjectRequest request = GetObjectRequest.builder()
      .bucket(FIRST_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(request);
    assertThat(responseBytes.asUtf8String()).isEqualTo(xmlContent);

    // Verify the file does NOT exist in the SECOND bucket
    GetObjectRequest secondBucketRequest = GetObjectRequest.builder()
      .bucket(SECOND_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    assertThatThrownBy(() -> s3Client.getObject(secondBucketRequest)).isInstanceOf(
      S3Exception.class
    );

    // Verify the changelog file exists in the FIRST bucket
    List<S3Object> firstBucketChangelogs = listObjectsInDirectory(FIRST_BUCKET_NAME, CHANGELOG_DIR);
    assertThat(firstBucketChangelogs).hasSize(1);
    S3Object changelog = firstBucketChangelogs.getFirst();
    assertThat(changelog.key()).endsWith(String.format("-%s.json", FIRST_DATATYPE));
    assertThat(getObjectContent(FIRST_BUCKET_NAME, changelog.key())).isEqualTo(
      "{\"change_all\": true}"
    );

    // Verify the changelog file does NOT exist in the SECOND bucket
    List<S3Object> secondBucketChangelogs = listObjectsInDirectory(
      SECOND_BUCKET_NAME,
      CHANGELOG_DIR
    );
    assertThat(secondBucketChangelogs).isEmpty();
  }

  @Test
  void publish_shouldRouteToSecondPublisherAndUploadToCorrectBucket() {
    // given
    String docNumber = "doc-xyz-789";
    String xmlContent = "<test-data>Another test</test-data>";
    var options = new PublishPort.Options(docNumber, xmlContent, SECOND_PUBLISHER_NAME);

    // when
    publishPort.publish(options);

    // then
    // Verify the file exists in the SECOND bucket
    GetObjectRequest request = GetObjectRequest.builder()
      .bucket(SECOND_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    ResponseBytes<GetObjectResponse> responseBytes = s3Client.getObjectAsBytes(request);
    assertThat(responseBytes.asUtf8String()).isEqualTo(xmlContent);

    // Verify the file does NOT exist in the FIRST bucket
    GetObjectRequest firstBucketRequest = GetObjectRequest.builder()
      .bucket(FIRST_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    assertThatThrownBy(() -> s3Client.getObject(firstBucketRequest)).isInstanceOf(
      S3Exception.class
    );

    // Verify the changelog file exists in the SECOND bucket
    List<S3Object> secondBucketChangelogs = listObjectsInDirectory(
      SECOND_BUCKET_NAME,
      CHANGELOG_DIR
    );
    assertThat(secondBucketChangelogs).hasSize(1);
    S3Object changelog = secondBucketChangelogs.getFirst();
    assertThat(changelog.key()).endsWith(String.format("-%s.json", SECOND_DATATYPE));
    assertThat(getObjectContent(SECOND_BUCKET_NAME, changelog.key())).isEqualTo(
      "{\"change_all\": true}"
    );

    // Verify the changelog file does NOT exist in the FIRST bucket
    List<S3Object> firstBucketChangelogs = listObjectsInDirectory(FIRST_BUCKET_NAME, CHANGELOG_DIR);
    assertThat(firstBucketChangelogs).isEmpty();
  }

  @Test
  void publish_shouldNotPublish_whenTargetIsUnknown() {
    // given
    String docNumber = "doc-def-789";
    String xmlContent = "<test-data>This should not be published</test-data>";
    var options = new PublishPort.Options(docNumber, xmlContent, "unknown-publisher");

    // when
    assertThatThrownBy(() -> publishPort.publish(options))
      .isInstanceOf(IllegalArgumentException.class)
      .hasMessageContaining("No publisher found for target: unknown-publisher");

    // then
    // Verify that NO file was created in EITHER bucket
    GetObjectRequest request1 = GetObjectRequest.builder()
      .bucket(FIRST_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    GetObjectRequest request2 = GetObjectRequest.builder()
      .bucket(SECOND_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();

    assertThatThrownBy(() -> s3Client.getObject(request1)).isInstanceOf(S3Exception.class);
    assertThatThrownBy(() -> s3Client.getObject(request2)).isInstanceOf(S3Exception.class);

    // Verify that NO changelog file was created in EITHER bucket
    assertThat(listObjectsInDirectory(FIRST_BUCKET_NAME, CHANGELOG_DIR)).isEmpty();
    assertThat(listObjectsInDirectory(SECOND_BUCKET_NAME, CHANGELOG_DIR)).isEmpty();
  }

  @Test
  void publish_shouldThrowValidationFailedException_whenXmlIsInvalid() throws Exception {
    // given
    String docNumber = "doc-invalid-123";
    String invalidXmlContent = "<invalid>";
    var options = new PublishPort.Options(docNumber, invalidXmlContent, FIRST_PUBLISHER_NAME);

    doThrow(new SAXParseException("XML is malformed", null, null, 1, 10))
      .when(xmlValidator)
      .validate(invalidXmlContent);

    // when / then
    assertThatThrownBy(() -> publishPort.publish(options))
      .isInstanceOf(ValidationFailedException.class)
      .hasMessageContaining(
        "XML validation failed for document doc-invalid-123 at line 1, column 10"
      );

    // Verify that no file was created in the bucket
    GetObjectRequest request = GetObjectRequest.builder()
      .bucket(FIRST_BUCKET_NAME)
      .key(String.format("%s.akn.xml", docNumber))
      .build();
    assertThatThrownBy(() -> s3Client.getObject(request)).isInstanceOf(S3Exception.class);
  }

  private List<S3Object> listObjectsInDirectory(String bucketName, String directoryPrefix) {
    ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
      .bucket(bucketName)
      .prefix(directoryPrefix)
      .build();
    return s3Client.listObjectsV2(listRequest).contents();
  }

  private String getObjectContent(String bucketName, String key) {
    GetObjectRequest request = GetObjectRequest.builder().bucket(bucketName).key(key).build();
    return s3Client.getObjectAsBytes(request).asUtf8String();
  }
}

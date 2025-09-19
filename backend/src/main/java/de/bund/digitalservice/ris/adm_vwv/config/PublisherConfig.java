package de.bund.digitalservice.ris.adm_vwv.config;

import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.PublishPort;
import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.S3PublishAdapter;
import de.bund.digitalservice.ris.adm_vwv.adapter.publishing.XmlValidator;
import jakarta.annotation.Nonnull;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import software.amazon.awssdk.services.s3.S3Client;

/**
 * Holds the config for all buckets published to.
 */
@Configuration
@Slf4j
public class PublisherConfig {

  @Bean("privateBsgPublisher")
  public PublishPort privateBsgPublisher(
    @Qualifier("privateBsgS3Client") S3Client s3Client,
    @Qualifier("bsgVwvValidator") XmlValidator validator,
    @Value("${otc.private-bsg-client.bucket-name}") String bucketName,
    @Value("${otc.obs.datatype}") String datatype
  ) {
    return new S3PublishAdapter(s3Client, validator, bucketName, datatype, "privateBsgPublisher");
  }

  /**
   * Creates a composite {@link PublishPort} bean that acts as a central dispatcher.
   * <p>
   * This bean is marked as {@link Primary} so that it becomes the default implementation
   * injected into services like {@code DocumentationUnitService}. Its role is to receive all
   * publish requests and delegate them to the appropriate concrete publisher instance
   * based on the {@code targetPublisher} specified in the {@link PublishPort.Options}.
   *
   * @param allPublishers A list of all other beans that implement the {@link PublishPort} interface,
   *                      automatically injected by Spring. These publisher beans are defined as a bean like
   *                     {@link PublisherConfig#privateBsgPublisher} where each is configured with a specific S3 client
   *                      and bucket name.
   * @return A single {@link PublishPort} instance that handles the routing logic.
   */
  @Bean
  @Primary
  public PublishPort compositePublisher(List<PublishPort> allPublishers) {
    Map<String, PublishPort> publisherMap = allPublishers
      .stream()
      .collect(Collectors.toMap(PublishPort::getName, Function.identity()));

    return new PublishPort() {
      @Override
      public String getName() {
        return "compositePublisher";
      }

      @Override
      public void publish(@Nonnull Options options) {
        String target = options.targetPublisher();
        PublishPort selectedPublisher = publisherMap.get(target);
        if (selectedPublisher != null) {
          selectedPublisher.publish(options);
        } else {
          log.error("No publisher found for target '{}'.", target);
          throw new IllegalArgumentException("No publisher found for target: " + target);
        }
      }
    };
  }
}

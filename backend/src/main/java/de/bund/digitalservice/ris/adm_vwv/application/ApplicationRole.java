package de.bund.digitalservice.ris.adm_vwv.application;

import java.util.List;
import java.util.stream.Stream;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.util.CollectionUtils;

/**
 * Defines application roles, each mapping to a document type and providing logic
 * to determine a user's {@link DocumentationOffice} from their JWT claims.
 */
@Getter
@RequiredArgsConstructor
public enum ApplicationRole {
  // TODO: Remove adm_vwv_user once roles are defined in bareId // NOSONAR
  ADMINISTRATIVE(List.of("adm_user", "adm_vwv_user"), DocumentTypeCode.ADMINISTRATIVE) {
    @Override
    public DocumentationOffice getDocumentationOffice(Jwt jwt) {
      // For administrative users, the office is always BSG.
      return DocumentationOffice.BSG;
    }
  },

  LITERATURE(List.of("literature_user"), DocumentTypeCode.LITERATURE_DEPENDENT) {
    @Override
    public DocumentationOffice getDocumentationOffice(Jwt jwt) {
      List<String> groups = jwt.getClaimAsStringList("groups");
      if (CollectionUtils.isEmpty(groups)) {
        throw new IllegalStateException(
          "User with role 'literature_user' is missing the required groups claim."
        );
      }
      String groupPath = groups.getFirst();
      String groupName = groupPath.substring(groupPath.lastIndexOf('/') + 1);
      return DocumentationOffice.valueOf(groupName.toUpperCase());
    }
  };

  private final List<String> roleNames;
  private final DocumentTypeCode documentTypeCode;

  /**
   * Determines the documentation office based on the specific logic for each role.
   * @param jwt The JWT token containing user claims.
   * @return The determined DocumentationOffice.
   */
  public abstract DocumentationOffice getDocumentationOffice(Jwt jwt);

  /**
   * Finds the corresponding ApplicationRole from a JWT role string.
   * @param roleName The role string from the token (e.g., "adm_user").
   * @return The matching ApplicationRole enum constant.
   * @throws IllegalArgumentException if no match is found.
   */
  public static ApplicationRole from(String roleName) {
    return Stream.of(values())
      .filter(role -> role.roleNames.stream().anyMatch(name -> name.equalsIgnoreCase(roleName)))
      .findFirst()
      .orElseThrow(() -> new IllegalArgumentException("Unknown application role: " + roleName));
  }
}

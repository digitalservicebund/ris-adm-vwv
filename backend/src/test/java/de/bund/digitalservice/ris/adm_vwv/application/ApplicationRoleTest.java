package de.bund.digitalservice.ris.adm_vwv.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class ApplicationRoleTest {

  @Mock
  private Jwt jwt;

  @Nested
  @DisplayName("Role Properties")
  class RoleProperties {

    @ParameterizedTest
    @MethodSource("provideRoleAndItsProperties")
    @DisplayName("should have the correct role name and document type")
    void shouldHaveCorrectProperties(
      ApplicationRole role,
      String expectedRoleName,
      DocumentTypeCode expectedType
    ) {
      // Then
      assertThat(role.getRoleName()).isEqualTo(expectedRoleName);
      assertThat(role.getDocumentTypeCode()).isEqualTo(expectedType);
    }

    private static Stream<Arguments> provideRoleAndItsProperties() {
      return Stream.of(
        Arguments.of(ApplicationRole.ADMINISTRATIVE, "adm_user", DocumentTypeCode.ADMINISTRATIVE),
        Arguments.of(
          ApplicationRole.LITERATURE,
          "literature_user",
          DocumentTypeCode.LITERATURE_DEPENDENT
        )
      );
    }
  }

  @Nested
  @DisplayName("getDocumentationOffice Logic")
  class DocumentationOfficeLogic {

    @Test
    @DisplayName("ADMINISTRATIVE role should always return BSG")
    void administrativeRole_shouldAlwaysReturnBsg() {
      // Given
      var role = ApplicationRole.ADMINISTRATIVE;

      // When
      var office = role.getDocumentationOffice(jwt);

      // Then
      assertThat(office).isEqualTo(DocumentationOffice.BSG);
    }

    @ParameterizedTest
    @MethodSource("provideGroupClaimsAndExpectedOffice")
    @DisplayName("LITERATURE role should extract office from groups claim")
    void literatureRole_shouldExtractOfficeFromGroups(
      List<String> groups,
      DocumentationOffice expectedOffice
    ) {
      // Given
      var role = ApplicationRole.LITERATURE;
      when(jwt.getClaimAsStringList("groups")).thenReturn(groups);

      // When
      var office = role.getDocumentationOffice(jwt);

      // Then
      assertThat(office).isEqualTo(expectedOffice);
    }

    private static Stream<Arguments> provideGroupClaimsAndExpectedOffice() {
      return Stream.of(
        Arguments.of(List.of("/literature/BSG"), DocumentationOffice.BSG),
        Arguments.of(List.of("/another/path/BFH", "/other/group"), DocumentationOffice.BFH),
        Arguments.of(List.of("BVERWG"), DocumentationOffice.BVERWG),
        Arguments.of(List.of("/some/path/BVERFG"), DocumentationOffice.BVERFG),
        Arguments.of(List.of("/bag"), DocumentationOffice.BAG)
      );
    }

    @Test
    @DisplayName(
      "LITERATURE role should throw IllegalStateException if groups claim is null or empty"
    )
    void literatureRole_shouldThrowExceptionForMissingGroups() {
      // Given
      var role = ApplicationRole.LITERATURE;
      // Test with null
      when(jwt.getClaimAsStringList("groups")).thenReturn(null);
      assertThatThrownBy(() -> role.getDocumentationOffice(jwt))
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("User with role 'literature_user' is missing the required groups claim.");

      // Test with empty list
      when(jwt.getClaimAsStringList("groups")).thenReturn(Collections.emptyList());
      assertThatThrownBy(() -> role.getDocumentationOffice(jwt))
        .isInstanceOf(IllegalStateException.class)
        .hasMessage("User with role 'literature_user' is missing the required groups claim.");
    }

    @Test
    @DisplayName("LITERATURE role should throw IllegalArgumentException for an unknown office name")
    void literatureRole_shouldThrowExceptionForUnknownOffice() {
      // Given
      var role = ApplicationRole.LITERATURE;
      when(jwt.getClaimAsStringList("groups")).thenReturn(List.of("/path/to/UNKNOWN_OFFICE"));

      // When & Then
      assertThatThrownBy(() -> role.getDocumentationOffice(jwt)).isInstanceOf(
        IllegalArgumentException.class
      );
    }
  }

  @Nested
  @DisplayName("fromRoleName Logic")
  class FromStaticMethod {

    @ParameterizedTest
    @CsvSource(
      {
        "adm_user, ADMINISTRATIVE",
        "literature_user, LITERATURE",
        "ADM_USER, ADMINISTRATIVE",
        "Literature_User, LITERATURE",
      }
    )
    @DisplayName("should return correct role for valid names")
    void shouldReturnCorrectRoleForValidName(String roleName, ApplicationRole expected) {
      // When
      var result = ApplicationRole.from(roleName);

      // Then
      assertThat(result).isEqualTo(expected);
    }

    @Test
    @DisplayName("should throw IllegalArgumentException for an unknown role name")
    void shouldThrowExceptionForUnknownRole() {
      // Given
      var unknownRoleName = "invalid_role";

      // When & Then
      assertThatThrownBy(() -> ApplicationRole.from(unknownRoleName))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessage("Unknown application role: " + unknownRoleName);
    }
  }
}

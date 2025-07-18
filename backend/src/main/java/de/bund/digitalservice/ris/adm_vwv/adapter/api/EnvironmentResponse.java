package de.bund.digitalservice.ris.adm_vwv.adapter.api;

/**
 * Information about the environment that can be shared with the frontend.
 *
 * @param authClientId Client ID that should be used when authenticating
 * @param authUrl      URL of the authentication service
 * @param authRealm    Realm that should be used when authenticating
 */
public record EnvironmentResponse(String authClientId, String authUrl, String authRealm) {}

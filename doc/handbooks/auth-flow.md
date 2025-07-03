# Authorization flow

As an authorization flow we use Oauth 2 with PKCE (Proof Key for Code Exchange), PKCE is recommended for all OAuth 2.0 flows involving public clients to provide an additional layer of security. It is supported by many identity providers and is considered a best practice for securing OAuth 2.0 implementations in public client applications.

As an authorization service we use Keycloak locally, an open-source identity and access management solution widely used for adding authentication and authorization to applications. On the server we use bare.ID.


```mermaid
sequenceDiagram
    participant User's Browser (Vue App)
    participant Keycloak / bare.id
    participant Backend (Spring Boot)

    Note over User's Browser (Vue App): User clicks "Login"
    User's Browser (Vue App)->>Keycloak / bare.id: 1. Redirect to Login Page with Client ID & PKCE Challenge

    Note over Keycloak / bare.id: User enters credentials and gives consent
    Keycloak / bare.id-->>User's Browser (Vue App): 2. Redirect back to /callback with temporary Authorization Code

    User's Browser (Vue App)->>Keycloak / bare.id: 3. Exchange Authorization Code for Tokens (behind the scenes)
    Keycloak / bare.id-->>User's Browser (Vue App): 4. Return secure Access Token & ID Token

    Note over User's Browser (Vue App): User is redirected to homepage
    Note over User's Browser (Vue App): User navigates to a protected route

    User's Browser (Vue App)->> Backend (Spring Boot): 5. Request protected data with Access Token in "Authorization" header

    Backend (Spring Boot)->>Keycloak / bare.id: 6. Validate token signature & claims
    Keycloak / bare.id-->> Backend (Spring Boot): 7. (Implicitly) Confirms token validity

    Backend (Spring Boot)-->>User's Browser (Vue App): 8. Return protected data (200 OK) or error (401 Unauthorized)
```

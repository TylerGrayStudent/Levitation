import { NextRequest } from 'next/server';

export interface AuthorizeRequest extends NextRequest {
  query: {
    client_id: string; // The client ID issued to the client during the registration process.
    redirect_uri: string; // The URL to which the authorization server will send the user-agent back once access is granted (or denied).
    response_type: string; // Tells the authorization server which grant to execute.
    response_mode?: string; // Specifies the method that should be used to transmit the authorization response to the client. Allows 'query', 'fragment', 'form_post', or 'web_message'.
    code_challenge?: string; // The PKCE code challenge.
    code_challenge_method?: string; // The PKCE code challenge method.
    scope: string; // The scope of the access request. Space delimited. Requires 'openid' for OpenID Connect.
    state: string; // An opaque value used by the client to maintain state between the request and callback.
    connection: string; // The connection to use for the authentication request.
    nonce: string; // A string value used to associate a client session with an ID Token, and to mitigate replay attacks.
  };
}

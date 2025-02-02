export interface TokenRequest {
  code?: string;
  client_id: string;
  client_secret?: string;
  code_verifier?: string;
}

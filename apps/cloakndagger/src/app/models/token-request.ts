import { NextApiRequest } from 'next';

export interface TokenRequest extends NextApiRequest {
  body: {
    code?: string;
    client_id: string;
    client_secret?: string;
    code_verifier?: string;
  };
}

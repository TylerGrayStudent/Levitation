import { NextApiRequest } from 'next';

export interface AuthorizeRequest extends NextApiRequest {
  query: {
    client_id: string;
    redirect_uri: string;
    response_type: string;
    code_challenge?: string;
    code_challenge_method?: string;
  };
}

import { PrismaClient } from '@prisma/client';
import { NextApiResponse } from 'next';
import { AuthorizeRequest } from '../../../../models/authorize-request';
import { generateAuthCode } from '../../../utils/generate-auth-code';

const prisma = new PrismaClient();

const authorize = async (req: AuthorizeRequest, res: NextApiResponse) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    code_challenge,
    code_challenge_method,
  } = req.query;

  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  if (response_type !== 'code') {
    return res.status(400).json({ message: 'Invalid response type' });
  }

  const cookies = req.cookies;

  // Store PCKE challenge (if provided)
  if (code_challenge && code_challenge_method) {
    cookies['pkce:code_challenge'] = code_challenge;
    cookies['pkce:code_challenge_method'] = code_challenge_method;
  }

  // Read the session cookie
  if (!cookies['session']) {
    return res.redirect(
      `/login?${new URLSearchParams(req.query as Record<string, string>)}`
    );
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: client_id },
  });
  if (!client) {
    return res.status(400).json({ message: 'Invalid client' });
  }

  if (client.pkceRequired && (!code_challenge || !code_challenge_method)) {
    return res
      .status(400)
      .json({ message: 'PKCE required, but challenge is missing' });
  }

  if (client.redirectUri !== redirect_uri) {
    return res.status(400).json({ message: 'Invalid redirect URI' });
  }

  const authCode = await generateAuthCode(
    code_challenge,
    code_challenge_method
  );

  res.json(`${redirect_uri}?code=${authCode}`);
};

export { authorize as GET };

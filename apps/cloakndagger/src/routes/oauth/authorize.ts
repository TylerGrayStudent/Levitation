import { PrismaClient } from '@prisma/client';
import { generateAuthCode } from './generate-auth-code';

const prisma = new PrismaClient();

export const authorize = async (req, res) => {
  const {
    client_id,
    redirect_uri,
    response_type,
    code_challenge,
    code_challenge_method,
  } = req.query;

  if (response_type !== 'code') {
    return res.status(400).json({ message: 'Invalid response type' });
  }

  if (!client_id || !redirect_uri || !response_type) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  console.log(client_id);
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

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextApiResponse } from 'next';
import { TokenRequest } from '../../../../models/token-request';
import { generateAccessToken } from '../../../utils/generate-access-token';

const prisma = new PrismaClient();

const token = async (req: TokenRequest, res: NextApiResponse) => {
  const { code, client_id, client_secret, code_verifier } = req.body;

  const tokenData = await prisma.oAuthToken.findUnique({
    where: { accessToken: code },
  });
  if (!tokenData) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: client_id },
  });

  if (!client) {
    return res.status(400).json({ error: 'Invalid client' });
  }

  if (client.pkceRequired && tokenData.codeChallenge) {
    if (!code_verifier) {
      return res.status(400).json({ error: 'Code verifier required' });
    }

    const expectedChallenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    if (expectedChallenge !== tokenData.codeChallenge) {
      return res.status(400).json({ error: 'Invalid code verifier' });
    }
  } else {
    if (client.clientSecret !== client_secret) {
      return res.status(400).json({ error: 'Invalid client' });
    }
  }

  if (!code) {
    return res.status(400).json({ error: 'Invalid code' });
  }

  const token = await generateAccessToken(code, client_id);
  if (!token) {
    return res.status(400).json({ error: 'Invalid code or client' });
  }

  res.json(token);
};

export { token as POST };

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { generateAccessToken } from '../../../utils/generate-access-token';

const prisma = new PrismaClient();

const token = async (req: NextRequest) => {
  const body = await req.json();
  const code = body.code;
  const client_id = body.client_id;
  const client_secret = body.client_secret;
  const code_verifier = body.code_verifier;

  console.log('code', code);
  const tokenData = await prisma.oAuthToken.findUnique({
    where: { accessToken: code },
  });
  if (!tokenData) {
    return NextResponse.json({ error: 'Invalid code' });
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: client_id },
  });

  if (!client) {
    return NextResponse.json({ error: 'Invalid client' });
  }

  if (client.pkceRequired && tokenData.codeChallenge) {
    if (!code_verifier) {
      return NextResponse.json({ error: 'Code verifier required' });
    }

    const expectedChallenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url');

    if (expectedChallenge !== tokenData.codeChallenge) {
      return NextResponse.json({ error: 'Invalid code verifier' });
    }
  } else {
    if (client.clientSecret !== client_secret) {
      return NextResponse.json({ error: 'Invalid client' });
    }
  }

  if (!code) {
    return NextResponse.json({ error: 'Invalid code' });
  }

  const token = await generateAccessToken(code, client_id);
  if (!token) {
    return NextResponse.json({ error: 'Invalid code or client' });
  }

  return NextResponse.json(token);
};

export { token as POST };

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { generateAuthCode } from '../../../utils/generate-auth-code';

const prisma = new PrismaClient();

const authorize = async (req: NextRequest) => {
  const query = req.nextUrl.searchParams;
  const client_id = query.get('client_id');
  const redirect_uri = query.get('redirect_uri');
  const response_type = query.get('response_type');
  const code_challenge = query.get('code_challenge');
  const code_challenge_method = query.get('code_challenge_method');

  if (!client_id || !redirect_uri || !response_type) {
    return NextResponse.json(
      { message: 'Missing parameters' },
      { status: 400 }
    );
  }

  if (response_type !== 'code') {
    return NextResponse.json(
      { message: 'Invalid response type' },
      { status: 400 }
    );
  }

  const cookies = req.cookies;

  // Store PCKE challenge (if provided)
  if (code_challenge && code_challenge_method) {
    cookies.set('pkce:code_challenge', code_challenge);
    cookies.set('pkce:code_challenge_method', code_challenge_method);
  }

  // Read the session cookie
  if (!cookies.get('session')?.value) {
    // Redirect to login page
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.search = req.nextUrl.search;
    return NextResponse.redirect(loginUrl.toString());
  }

  console.log(1);

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId: client_id },
  });

  console.log(2);
  if (!client) {
    return NextResponse.json({ message: 'Invalid client' }, { status: 400 });
  }

  console.log(3);

  if (client.pkceRequired && (!code_challenge || !code_challenge_method)) {
    return NextResponse.json(
      { message: 'PKCE required, but challenge is missing' },
      { status: 400 }
    );
  }

  console.log(4);
  if (client.redirectUri.includes(redirect_uri)) {
    return NextResponse.json(
      { message: 'Invalid redirect URI' },
      { status: 400 }
    );
  }

  console.log(5);
  const authCode = await generateAuthCode(
    code_challenge ?? '',
    code_challenge_method ?? ''
  );

  console.log(6);
  console.log('redirect', `${redirect_uri}?code=${authCode}`);
  return NextResponse.redirect(`${redirect_uri}?code=${authCode}`);
};

export { authorize as GET };

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function generateAuthCode(
  code_challenge?: string,
  code_challenge_method?: string
) {
  const authCode = randomBytes(32).toString('hex');

  await prisma.oAuthToken.create({
    data: {
      accessToken: authCode,
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      userId: 'e7dac523-62f3-4b85-8eaf-8d54e85b9922',
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
    },
  });

  return authCode;
}

import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function generateAuthCode(
  code_challenge?: string,
  code_challenge_method?: string,
  user_id = 'e7dac523-62f3-4b85-8eaf-8d54e85b9922'
) {
  // clear out any existing auth codes
  await prisma.oAuthToken.deleteMany({
    where: {
      userId: user_id,
    },
  });
  console.log('Deleted existing auth codes');

  const authCode = randomBytes(32).toString('hex');
  await prisma.oAuthToken.create({
    data: {
      accessToken: authCode,
      refreshToken: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      userId: user_id,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
    },
  });
  console.log('Auth code saved to database');

  return authCode;
}

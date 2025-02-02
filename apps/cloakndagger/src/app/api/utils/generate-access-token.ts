import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY ?? '';

export const generateAccessToken = async (code: string, clientId: string) => {
  const tokenData = await prisma.oAuthToken.findFirst({
    where: { accessToken: code },
  });

  if (!tokenData) {
    return null;
  }

  const accessToken = jwt.sign(
    { userId: tokenData.userId, clientId: clientId },
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  const refreshToken = randomBytes(64).toString('hex');

  await prisma.oAuthToken.update({
    where: { accessToken: code },
    data: {
      refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: 3600,
  };
};

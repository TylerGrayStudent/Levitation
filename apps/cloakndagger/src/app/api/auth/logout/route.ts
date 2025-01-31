import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'v8';

const logout = (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader(
    'Set-Cookie',
    serialize('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    })
  );

  res.json({ message: 'Logged out' });
};

export { logout as POST };

import { NextResponse } from 'next/server';

const logout = () => {
  const res = NextResponse.json({ message: 'Logged out' }, { status: 200 });
  res.cookies.set('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Expire immediately
  });
  return res;
};

export { logout as POST };

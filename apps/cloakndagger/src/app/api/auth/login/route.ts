import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET_KEY ?? '';
console.log('SECRET_KEY', SECRET_KEY);

const login = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const email = body.email;
    const password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Missing email or password' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: '1h',
    });

    // Set the cookie (httpOnly for security)
    const res = NextResponse.json({ message: 'Logged in' }, { status: 200 });
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};

export { login as POST };

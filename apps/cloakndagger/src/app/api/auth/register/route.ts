import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { CreateUserRequest } from '../../../models/create-user-request';

const prisma = new PrismaClient();

const register = async (
  req: Request<unknown, unknown, CreateUserRequest>,
  res: Response
) => {
  const { email, password } = req.body;

  // Ensure email is valid
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }

  // Check if user already exists
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Ensure password is valid
  if (!password || password.length < 12) {
    return res
      .status(400)
      .json({ message: 'Password must be at least 12 characters' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role: 'USER',
      createdAt: new Date(),
    },
  });

  return res.status(201).json({ message: 'User created' });
};

export { register as POST };

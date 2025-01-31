import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Request, Response, Router } from 'express';
import { CreateUserRequest } from '../../models/requests/create-user-request';

const router = Router();
const prisma = new PrismaClient();
const SECRET_KEY = process.env.SECRET;

router.post(
  '/',
  async (req: Request<unknown, unknown, CreateUserRequest>, res: Response) => {
    const { email, password } = req.body;

    // Ensure email is valid
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    // Ensure password is valid
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters' });
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
  }
);

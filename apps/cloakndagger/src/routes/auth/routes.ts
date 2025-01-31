import { Router } from 'express';
import { login } from './login';
import { register } from './register';
import { test } from './test';

const router = Router();

router.get('/test', test);
router.post('/register', register);
router.post('/login', login);

export { router as authRoutes };

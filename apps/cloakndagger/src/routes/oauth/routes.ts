import { Router } from 'express';
import { authorize } from './authorize';
import { token } from './token';

const router = Router();

router.get('/authorize', authorize);
router.post('/token', token);

export { router as oauthRoutes };

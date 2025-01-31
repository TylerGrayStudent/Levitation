import express from 'express';
import next from 'next';
import path from 'path';
import { authRoutes } from './routes/auth/routes';
import { oauthRoutes } from './routes/oauth/routes';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const dev = process.env.NODE_ENV !== 'production';

const appDir = path.join(__dirname, '../../../../identifier/.next/server');
console.log('__dirname: ', __dirname);
console.log('appDir: ', appDir);

const app = next({ dev, dir: appDir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  server.use(express.json());

  const apiRouter = express.Router();

  apiRouter.get('/', (req, res) => {
    const crypto = require('crypto');

    const codeVerifier = crypto.randomBytes(32).toString('hex');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    console.log('code_verifier: ', codeVerifier);
    console.log('code_challenge: ', codeChallenge);

    res.send({ message: 'Hello API', codeVerifier, codeChallenge });
  });

  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/oauth', oauthRoutes);

  server.use('/api', apiRouter);

  // Serve Next.js static files (like JS, CSS, images)
  server.use(express.static(path.join(appDir, 'static')));

  // Handle all Next.js routes
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, host, () => {
    console.log(`[ ready ] http://${host}:${port}`);
  });
});

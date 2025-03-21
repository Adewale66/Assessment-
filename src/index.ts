import { Elysia } from 'elysia';
import AuthController from './auth/auth';
import { swagger } from '@elysiajs/swagger';
import UserController from './user/user';

const PORT = process.env.PORT || 8080;

const app = new Elysia()
  .use(
    swagger({
      path: '/docs',
    }),
  )
  .group('/api', (app) => app.use(AuthController).use(UserController))
  .listen(PORT);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${PORT}`);

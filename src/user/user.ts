import jwt from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';
import db from '../lib/db';

const UserController = new Elysia({
  prefix: '/user',
})
  .use(
    jwt({
      name: 'jwt',
      secret: Bun.env.JWT_SECRET!,
      expr: '1d',
    }),
  )
  .derive({ as: 'scoped' }, async ({ jwt, headers, set }) => {
    const header = headers['authorization'];

    if (!header) {
      set.status = 401;
      throw new Error('Access token is missing');
    }

    const token = header.split(' ')[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 403;
      throw new Error('Access token is invalid');
    }

    const email = payload.sub;
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        id: true,
        createdAt: true,
      },
    });

    return { user };
  })
  .get('/me', ({ user }) => {
    return {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };
  })
  .patch(
    '/me',
    async ({ user, body }) => {
      const newPassword = await Bun.password.hash(body.password);
      await db.user.update({
        where: {
          email: user?.email,
        },
        data: {
          email: body.email,
          hashedPassword: newPassword,
        },
      });

      return {
        success: true,
        message: 'Details changed successfully',
      };
    },
    {
      body: t.Object({
        email: t.String({
          format: 'email',
        }),
        password: t.String(),
      }),
    },
  );

export default UserController;

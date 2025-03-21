import jwt from '@elysiajs/jwt';
import { Elysia, t } from 'elysia';
import db from '../lib/db';

const UserController = new Elysia({
  prefix: '/user',
})
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET as string,
      expr: '1d',
    }),
  )
  .derive({ as: 'scoped' }, async ({ jwt, headers }) => {
    const header = headers['authorization'];
    const Auth: { user: { email: string } | null } = {
      user: null,
    };
    if (header) {
      const token = header.split(' ')[1];
      const verified = await jwt.verify(token);

      if (verified) {
        const user = await db.user.findFirst({
          where: {
            email: verified.email as string,
          },
          select: {
            email: true,
          },
        });

        Auth.user = user;
      }
    }
    return { Auth };
  })
  .macro(({ onBeforeHandle }) => ({
    isSignIn(value: boolean) {
      onBeforeHandle(({ Auth, error }) => {
        if (!Auth?.user || !Auth.user)
          return error(401, {
            success: false,
            message: 'Unauthorized',
          });
      });
    },
  }))
  .get(
    '/me',
    ({ Auth: { user } }) => {
      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      };
    },
    {
      isSignIn: true,
    },
  )
  .post(
    '/',
    async ({ Auth: { user }, body }) => {
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
      isSignIn: true,
      body: t.Object({
        email: t.String({
          format: 'email',
        }),
        password: t.String(),
      }),
    },
  );

export default UserController;

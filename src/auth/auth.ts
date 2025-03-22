import { Elysia, error, t, ValidationError } from 'elysia';
import { AuthModel } from './auth.dto';
import AuthService from './auth.service';
import jwt from '@elysiajs/jwt';

const AuthController = new Elysia({
  prefix: '/auth',
  detail: {
    tags: ['auth'],
  },
})
  .decorate('service', new AuthService())
  .use(
    jwt({
      name: 'jwt',
      secret: Bun.env.JWT_SECRET!,
      expr: '1d',
    }),
  )
  .use(AuthModel)
  .get('/reset-password', ({ service }) => {
    return service.resetPassword();
  })
  .get('/reset-password/:token', ({ params: { token }, service }) => {
    return service.verifyToken(token);
  })
  .post(
    '/signin',
    ({ service, jwt, body }) => {
      return service.login({ ...body, jwt });
    },
    {
      body: 'auth.sign',
      error({ code, error: err }) {
        if (code == 'VALIDATION') {
          const errors = err as ValidationError;
          const validationErrors = errors.all.map((e) => {
            if (e.summary !== undefined) {
              return {
                field: e.path.slice(1),
                message: e.message,
              };
            }
          });

          return error(422, validationErrors);
        }
        console.log(code);
        return error(500, {
          success: false,
          message: 'Something went wrong. Try again later',
        });
      },
    },
  )
  .post(
    '/signup',
    ({ service, body }) => {
      return service.registerUser(body);
    },
    {
      body: 'auth.sign',
      error({ code, error: err }) {
        if ((code as unknown) === 'P2002') {
          return error(400, {
            success: false,
            message: 'User already exists',
          });
        }
        if (code == 'VALIDATION') {
          const errors = err as ValidationError;
          const validationErrors = errors.all.map((e) => {
            if (e.summary !== undefined) {
              return {
                field: e.path.slice(1),
                message: e.message,
              };
            }
          });

          return error(422, validationErrors);
        }
        console.log(code);
        return error(500, {
          success: false,
          message: 'Something went wrong. Try again later',
        });
      },
    },
  );

export default AuthController;

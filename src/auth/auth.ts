import { Elysia, error, t } from 'elysia';
import { authDto } from './auth.dto';
import AuthService from './auth.service';
import jwt from '@elysiajs/jwt';

const AuthController = new Elysia({
  prefix: '/auth',
})
  .decorate('auth', new AuthService())
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET as string,
      expr: '1d',
    }),
  )
  .get('/reset-password', () => {
    return {
      otp: '143258',
    };
  })
  .get(
    '/reset-password/:token',
    ({ params }) => {
      if (params.token !== '143258') {
        return error(400, {
          status: false,
          message: 'Invalid OTP token',
        });
      }

      return {
        success: true,
        message: 'Password reset',
      };
    },
    {
      params: t.Object({
        token: t.String(),
      }),
    },
  )
  .post(
    '/signup',
    async ({ auth, body, set }) => {
      const res = await auth.registerUser(body);
      if (!res) {
        return error(400, {
          success: false,
          message: 'User already exists',
        });
      }
      set.status = 201;
      return res;
    },
    {
      body: authDto,
    },
  )
  .post(
    '/signin',
    async ({ auth, jwt, body }) => {
      const user = await auth.login(body);
      if (!user) {
        return error(401, {
          success: false,
          message: 'Invalid email or passsword',
        });
      }
      const access_token = await jwt.sign(user);
      return {
        success: true,
        message: 'Signed in successfully',
        data: {
          access_token,
        },
      };
    },
    {
      body: authDto,
    },
  );

export default AuthController;

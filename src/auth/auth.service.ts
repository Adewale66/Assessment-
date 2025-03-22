import { error, t } from 'elysia';
import db from '../lib/db';
import { JWTPayloadSpec } from '@elysiajs/jwt';

type Body = {
  email: string;
  password: string;
  jwt: {
    readonly sign: (
      morePayload: Record<string, string | number> & JWTPayloadSpec,
    ) => Promise<string>;
    readonly verify: (
      jwt?: string,
    ) => Promise<false | (Record<string, string | number> & JWTPayloadSpec)>;
  };
};

export default class AuthService {
  async registerUser({ email, password }: { email: string; password: string }) {
    const hashedPassword = await Bun.password.hash(password);
    await db.user.create({
      data: {
        email: email,
        hashedPassword: hashedPassword,
      },
    });

    return error(201, {
      success: true,
      message: 'User created successfully',
    });
  }

  async login({ email, password, jwt }: Body) {
    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        email: true,
        hashedPassword: true,
      },
    });
    if (!user) {
      return error(401, {
        success: false,
        message: 'Invalid email or passsword',
      });
    }

    if (!(await Bun.password.verify(password, user.hashedPassword))) {
      return error(401, {
        success: false,
        message: 'Invalid email or passsword',
      });
    }

    const access_token = await jwt.sign({
      sub: user.email,
    });
    return {
      success: true,
      message: 'Signed in successfully',
      data: {
        access_token,
      },
    };
  }

  resetPassword() {
    return {
      otp: '143258',
    };
  }

  verifyToken(token: string) {
    if (token !== '143258') {
      return error(400, {
        status: false,
        message: 'Invalid OTP token',
      });
    }

    return {
      success: true,
      message: 'Password reset',
    };
  }
}

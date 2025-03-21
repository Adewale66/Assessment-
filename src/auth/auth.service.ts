import { error, t } from 'elysia';
import db from '../lib/db';

export default class AuthService {
  async registerUser({ email, password }: { email: string; password: string }) {
    const userExists = await db.user.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      return null;
    }

    const hashedPassword = await Bun.password.hash(password);
    await db.user.create({
      data: {
        email: email,
        hashedPassword: hashedPassword,
      },
    });

    return {
      success: true,
      message: 'User created successfully',
    };
  }

  async login({ email, password }: { email: string; password: string }) {
    const user = await db.user.findFirst({
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
      return null;
    }

    if (!(await Bun.password.verify(password, user.hashedPassword))) {
      return null;
    }

    const { hashedPassword, ...userDetails } = user;

    return userDetails;
  }
}

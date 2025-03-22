import Elysia, { t } from 'elysia';

const AuthModel = new Elysia({ name: 'Model.Auth' }).model({
  'auth.sign': t.Object({
    email: t.String({
      format: 'email',
    }),
    password: t.String({
      minLength: 5,
    }),
  }),
});

export { AuthModel };

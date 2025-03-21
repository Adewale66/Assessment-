import { t } from 'elysia';

const authDto = t.Object({
  email: t.String({
    format: 'email',
  }),
  password: t.String({
    minLength: 5,
  }),
});

export { authDto };

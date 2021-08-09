import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import prisma from '../../../lib/prisma';

const providers = [];

// Add credentials auth provider for tests with Cypress
if (process.env.CYPRESS === 'true') {
  providers.push(
    Providers.Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Username',
          type: 'text',
          placeholder: 'username',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      async authorize(credentials: { username?: string; password?: string }, req) {
        const { username } = credentials;

        const userData = {
          name: username || 'e2e@placelist.com',
          email: username || 'e2e@placelist.com',
        };
        const user = await prisma.user.upsert({
          where: {
            email: userData.email,
          },
          create: {
            name: userData.name,
            email: userData.email,
          },
          update: {
            name: userData.name,
          },
        });

        return Promise.resolve(user);
      },
    })
  );
}

providers.push(
  Providers.Google({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  })
);

export default NextAuth({
  providers,
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    // Use jwt session in Cypress tests - required to use credentials provider
    jwt: process.env.CYPRESS === 'true',
  },
});

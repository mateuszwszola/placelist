import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { getSession } from 'next-auth/client';
import { ErrorHandler } from 'utils/error';

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;

  try {
    if (method === 'GET') {
      const session = await getSession({ req });

      if (!session?.user?.email) {
        throw new ErrorHandler(401, 'You are not authenticated');
      }
      // TODO: get user profile with some info like number of reviews added, favorite places
      const user = await prisma.user.findUnique({
        where: {
          email: session.user.email,
        },
        select: {
          name: true,
          image: true,
          profile: {
            select: {
              bio: true,
            },
          },
        },
      });

      return res.json({ profile: user });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      if (error instanceof ErrorHandler) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Something went wrong.' });
      }
    }
  }
}

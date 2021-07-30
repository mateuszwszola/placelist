import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from 'lib/prisma';
import { ErrorHandler } from 'utils/error';
import { requireUserSession } from 'utils/session';

export default async function profileHandler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { method } = req;

  try {
    if (method === 'GET') {
      requireUserSession(req, async (session) => {
        const userQuery = prisma.user.findUnique({
          where: {
            email: session.user?.email as string,
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

        // Get visited places
        const visitedPlacesQuery = prisma.place.groupBy({
          by: ['city', 'country', 'adminDivision'],
          where: {
            reviews: {
              some: {
                author: {
                  email: session.user?.email as string,
                },
              },
            },
          },
        });

        const [user, visitedPlaces] = await Promise.all([userQuery, visitedPlacesQuery]);

        Object.assign(user, { visitedPlaces: visitedPlaces });

        return res.json({ profile: user });
      });
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

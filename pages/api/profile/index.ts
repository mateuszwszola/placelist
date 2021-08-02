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
      return requireUserSession(req, async (session) => {
        const profileQuery = prisma.user.findUnique({
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

        const userVisitedPlacesQuery = prisma.place.findMany({
          where: {
            id: {
              in: (
                await prisma.review.groupBy({
                  by: ['placeId'],
                  where: {
                    author: {
                      email: session.user?.email,
                    },
                  },
                  take: 10,
                  orderBy: {
                    placeId: 'asc',
                  },
                })
              ).map((place) => place.placeId),
            },
          },
        });

        const [profile, visitedPlaces] = await Promise.all([profileQuery, userVisitedPlacesQuery]);

        Object.assign(profile, { visitedPlaces: visitedPlaces });

        return res.json({ profile });
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

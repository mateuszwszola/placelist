import prisma from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  switch (req.method) {
    case 'GET':
      try {
        // Get user session
        const session = await getSession({ req });

        if (!session?.user?.email) {
          return res.status(401).json({ message: 'You are not authenticated' });
        }

        const { limit, offset } = req.query;

        // Get user reviews
        const userReviews = await prisma.review.findMany({
          take: Number(limit) || 20,
          skip: Number(offset) || 0,
          include: {
            author: {
              select: { name: true, image: true },
            },
            place: {
              // Get additional place info to be displayed on user's dashboard
              select: { id: true, city: true, country: true, adminDivision: true },
            },
          },
          orderBy: {
            updatedAt: 'desc',
          },
          where: {
            author: {
              email: session.user.email,
            },
          },
        });

        return res.json({ reviews: userReviews });
      } catch (err) {
        console.log('An error has occured: ', err.message);
        res.status(500).json({ message: `An error has occured: ${err.message}` });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

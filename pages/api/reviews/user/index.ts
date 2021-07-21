import prisma from 'lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import { ErrorHandler } from 'utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (method === 'GET') {
      // Get user session
      const session = await getSession({ req });

      if (!session?.user?.email) {
        throw new ErrorHandler(401, 'You are not authenticated');
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
          createdAt: 'desc',
        },
        where: {
          author: {
            email: session.user.email,
          },
        },
      });

      return res.json({ reviews: userReviews });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${req.method} Not Allowed` });
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

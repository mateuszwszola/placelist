import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (req.method === 'GET') {
      const { id: placeId } = req.query;
      let { offset, limit } = req.query;

      if (Array.isArray(offset)) offset = offset[0];
      if (Array.isArray(limit)) limit = limit[0];

      const placeWithReviews = await prisma.place.findUnique({
        where: { id: Number(placeId) },
        include: {
          reviews: {
            skip: Number(offset) || 0,
            take: Number(limit) || 20,
            include: {
              author: {
                select: { name: true, image: true },
              },
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      });

      res.json({ place: placeWithReviews });
    } else if (req.method === 'POST') {
      const session = await getSession({ req });

      if (!session?.user?.email) {
        return res.status(401).json({ message: 'You are not authenticated' });
      }

      const { email } = session.user;
      const { id: placeId } = req.query;
      const { comment, cost, safety, fun } = req.body;

      const review = await prisma.review.create({
        data: {
          comment,
          cost: Number(cost),
          safety: Number(safety),
          fun: Number(fun),
          author: {
            connect: { email },
          },
          place: {
            connect: { id: Number(placeId) },
          },
        },
      });

      res.json({ review });
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (err) {
    console.log('An error has occured: ', err.message);
    res.status(500).json({ message: `An error has occured: ${err.message}` });
  }
}

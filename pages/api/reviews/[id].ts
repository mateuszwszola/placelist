import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from 'lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (req.method === 'GET') {
      const { id } = req.query;

      const review = await prisma.review.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      res.json({ review });
    } else if (req.method === 'PUT' || req.method === 'DELETE') {
      const session = await getSession({ req });

      if (!session?.user?.email) {
        return res.status(401).json({ message: 'You are not authenticated' });
      }

      const { id } = req.query;

      const existingReview = await prisma.review.findUnique({
        where: { id: Number(id) },
        include: {
          author: {
            select: {
              email: true,
            },
          },
        },
      });

      if (!existingReview) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (session.user.email !== existingReview.author?.email) {
        return res.status(403).json({ message: 'You are not authorized' });
      }

      if (req.method === 'PUT') {
        const { comment, cost, safety, fun } = req.body;

        const updatedReview = await prisma.review.update({
          where: {
            id: Number(id),
          },
          data: {
            comment: comment || '',
            cost: Number(cost),
            safety: Number(safety),
            fun: Number(fun),
          },
        });

        res.json({ review: updatedReview });
      } else {
        const deletedReview = await prisma.review.delete({
          where: { id: Number(id) },
        });

        res.json({ review: deletedReview });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (err) {
    console.log('An error has occured: ', err.message);
    res.status(500).json({ message: `An error has occured: ${err.message}` });
  }
}

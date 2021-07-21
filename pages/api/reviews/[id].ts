import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from 'lib/prisma';
import { ErrorHandler } from 'utils/error';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (method === 'GET') {
      const { id } = req.query;

      const review = await prisma.review.findUnique({
        where: {
          id: Number(id),
        },
      });

      if (!review) {
        throw new ErrorHandler(404, `Review with id ${id} not found`);
      }

      return res.json({ review });
    } else if (method === 'PUT' || method === 'DELETE') {
      const { id } = req.query;

      const session = await getSession({ req });

      if (!session?.user?.email) {
        throw new ErrorHandler(401, 'You are not authenticated');
      }

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
        throw new ErrorHandler(404, `Review with id ${id} not found`);
      }

      if (session.user.email !== existingReview.author?.email) {
        throw new ErrorHandler(403, 'You are not authorized');
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

        return res.json({ review: updatedReview });
      } else {
        // DELETE
        const deletedReview = await prisma.review.delete({
          where: { id: Number(id) },
        });

        return res.json({ review: deletedReview });
      }
    } else {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    // TODO: Add logging
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

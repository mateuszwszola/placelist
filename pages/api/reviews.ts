import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const reviews = await prisma.review.findMany();
        res.json({ reviews });
        break;
      case 'POST':
        const { authorId, placeId, comment, cost, safety, fun } = req.body;

        const review = await prisma.review.create({
          data: {
            comment,
            cost: Number(cost),
            safety: Number(safety),
            fun: Number(fun),
            author: {
              connect: { id: Number(authorId) }
            },
            place: {
              connect: { id: Number(placeId) }
            }
          }
        });

        res.json({ review });
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (err) {
    console.log('An error has occured: ', err.message);
  }
}

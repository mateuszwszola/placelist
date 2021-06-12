import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (req.method === 'GET') {
      const session = await getSession({ req });
      console.log('api session', session);
      const reviews = await prisma.review.findMany({ take: 100 });
      res.json({ reviews });
    } else if (req.method === 'POST') {
      const session = await getSession({ req });

      if (!session?.user?.email) {
        return res.status(401).json({ message: 'You are not authorized' });
      }

      const { email } = session.user;

      // TODO: Validate city and country
      const { city, country, comment, cost, safety, fun } = req.body;

      const [review] = await Promise.all([
        prisma.review.create({
          data: {
            comment,
            cost: Number(cost),
            safety: Number(safety),
            fun: Number(fun),
            author: {
              connect: { email },
            },
            place: {
              connect: { city_country: { city, country } },
            },
          },
        }),
        prisma.place.upsert({
          where: {
            city_country: { city, country },
          },
          create: { city, country },
          update: {}, // TODO: get photo url
        }),
      ]);

      res.json({ review });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
    }
  } catch (err) {
    console.log('An error has occured: ', err.message);
    res.status(500).json({ message: `An error has occured: ${err.message}` });
  }
}

import { pick } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // TODO: Add query params
        const reviews = await prisma.review.findMany({ take: 100 });
        res.json({ reviews });
        break;
      case 'POST':
        // TODO: get authorId from a user token
        const { authorId } = req.body;
        // TODO: Validate city and country

        const placeValues = pick(req.body, ['city', 'country', 'photoUrl']);
        const reviewValues = pick(req.body, ['comment', 'cost', 'safety', 'fun']);

        const [review] = await Promise.all([
          prisma.review.create({
            data: {
              ...reviewValues,
              author: {
                connect: { id: authorId },
              },
              place: {
                connect: { city_country: pick(placeValues, ['city', 'country']) },
              },
            },
          }),
          prisma.place.upsert({
            where: {
              city_country: pick(placeValues, ['city', 'country']),
            },
            create: placeValues,
            update: pick(placeValues, ['photoUrl']),
          }),
        ]);

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

import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from '../../lib/prisma';
import { CITIES_ROOT_API_URL } from 'components/useCitySearch';
import { Prisma } from '@prisma/client';

type TLocationResponse = {
  _links: {
    ['city:admin1_division']: {
      name: string;
    };
    ['city:country']: {
      name: string;
    };
  };
  full_name: string;
  geoname_id: number;
  name: string;
  population: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (req.method === 'GET') {
      let { placeId } = req.query;
      if (Array.isArray(placeId)) placeId = placeId[0];

      let query: Prisma.ReviewFindManyArgs = {
        take: 100,
        include: {
          author: {
            select: { name: true, image: true },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      };

      if (placeId) {
        query = {
          ...query,
          where: {
            placeId: Number(placeId),
          },
        };
      }

      const reviews = await prisma.review.findMany(query);

      res.json({ reviews });
    } else if (req.method === 'POST') {
      const session = await getSession({ req });

      if (!session?.user?.email) {
        return res.status(401).json({ message: 'You are not authorized to add a review' });
      }

      const { email } = session.user;
      const { locationId, comment, cost, safety, fun } = req.body;

      if (!locationId) {
        return res.status(400).json({ message: 'Location is ambiguous' });
      }

      // Validate location
      const locationResponse = await axios.get<TLocationResponse>(
        `${CITIES_ROOT_API_URL}/geonameid:${locationId}`
      );

      const { name: city } = locationResponse.data;
      const { name: country } = locationResponse.data['_links']['city:country'];
      const { name: adminDivision } = locationResponse.data['_links']['city:admin1_division'];

      await prisma.place.upsert({
        where: {
          geonameId: locationId,
        },
        create: { geonameId: locationId, city, country, adminDivision },
        update: {},
      });

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
            connect: { geonameId: locationId },
          },
        },
      });

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

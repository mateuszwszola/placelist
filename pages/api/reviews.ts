import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';
import prisma from '../../lib/prisma';
import { CITIES_ROOT_API_URL } from 'components/useCitySearch';
import { Prisma } from '@prisma/client';

type LocationResponse = {
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
      const locationResponse = await axios.get<LocationResponse>(
        `${CITIES_ROOT_API_URL}/geonameid:${locationId}`
      );

      // TODO: get location photo url

      const city = locationResponse.data.name;
      const country = locationResponse.data['_links']['city:country'].name;

      await prisma.place.upsert({
        where: {
          city_country: { city, country },
        },
        create: { city, country },
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
            connect: { city_country: { city, country } },
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

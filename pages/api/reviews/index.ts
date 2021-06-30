import { Prisma, Review } from '@prisma/client';
import axios from 'axios';
import { CITIES_ROOT_API_URL } from 'components/useCitySearch';
import prisma from 'lib/prisma';
import { pick } from 'lodash';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/client';

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
      const { placeId, offset, limit } = req.query;

      let query: Prisma.ReviewFindManyArgs = {
        take: Number(limit) || 20,
        skip: Number(offset) || 0,
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
      // Get user session
      const session = await getSession({ req });
      if (!session?.user?.email) {
        return res.status(401).json({ message: 'You are not authenticated' });
      }

      // Get values
      const statsFields = ['cost', 'safety', 'fun'];
      const requiredFields = ['locationId', ...statsFields];
      const fields = [...requiredFields, 'comment'];

      const values = pick(req.body, fields);

      // Validate values
      const errors: { [key: string]: string } = {};
      // Validate required fields
      requiredFields.forEach((field) => {
        if (!values[field]) {
          if (field === 'locationId') {
            errors[field] = 'Location is ambiguous';
          } else {
            errors[field] = `"${field}" is missing in a request body`;
          }
        }
      });

      // Validate review stats values
      for (const stat in pick(values, statsFields)) {
        if (Number.isNaN(values[stat])) {
          errors[stat] = `"${stat}" property must be an integer`;
        }
        // Parse stats to integers
        values[stat] = Number.parseInt(values[stat]);
        if (values[stat] < 0 || values[stat] > 10) {
          errors[stat] = `"${stat}" property must be an integer between 0 and 10`;
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ message: Object.values(errors).join(', ') });
      }

      // Validate location
      let locationResponse;
      try {
        locationResponse = await axios.get<TLocationResponse>(
          `${CITIES_ROOT_API_URL}/geonameid:${values.locationId}`
        );
      } catch (err) {
        return res.status(400).json({ message: 'Location is ambiguous' });
      }

      const { name: city } = locationResponse.data;
      const { name: country } = locationResponse.data['_links']['city:country'];
      const { name: adminDivision } = locationResponse.data['_links']['city:admin1_division'];

      const { locationId } = values;

      await prisma.place.upsert({
        where: {
          geonameId: locationId,
        },
        create: { geonameId: locationId, city, country, adminDivision },
        update: {},
      });

      const review = await prisma.review.create({
        data: {
          author: {
            connect: { email: session.user.email },
          },
          place: {
            connect: { geonameId: locationId },
          },
          ...(pick(values, ['comment', ...statsFields]) as Pick<
            Review,
            'cost' | 'fun' | 'safety' | 'comment'
          >),
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

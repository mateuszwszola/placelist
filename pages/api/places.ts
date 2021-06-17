import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        // TODO: Add filters and get statistics
        const places = await prisma.place.findMany();
        res.json({ places });
      } catch (err) {
        console.log('An error has occured: ', err.message);
        res.status(500).json({ message: 'There was a problem fetching places' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

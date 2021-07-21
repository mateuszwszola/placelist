import { getPlacesWithStatistics } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const { method } = req;

  try {
    if (method === 'GET') {
      let { offset, limit } = req.query;

      if (Array.isArray(offset)) offset = offset[0];
      if (Array.isArray(limit)) limit = limit[0];

      const places = await getPlacesWithStatistics(Number(offset) ?? 0, Number(limit) ?? 20);

      res.json({ places });
    } else {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not get places' });
  }
}

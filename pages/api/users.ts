import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

type Data = {
  users?: User[];
  message?: string;
};

export default async (req: NextApiRequest, res: NextApiResponse<Data>) => {
  try {
    if (req.method === 'GET') {
      const allUsers = await prisma.user.findMany({
        include: {
          profile: true,
        },
      });

      res.status(200).json({ users: allUsers });
    } else if (req.method === 'POST') {
      await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          profile: {
            create: {
              bio: req.body.bio,
            },
          },
        },
      });

      res.status(200).json({ message: 'OK' });
    }
  } catch (err) {
    console.error('error', err);
    res.status(500).json({ message: err.message });
  } finally {
    await prisma.$disconnect();
  }
};

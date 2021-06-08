import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const reviews = await prisma.review.findMany();
        res.json({ reviews });
      } catch (err) {
        console.log("An error has occured: ", err.message);
      }
      break;
    case "POST":
      try {
        const { authorId, comment, cost, safety, fun, city, country } = req.body;

        const result = await prisma.review.create({
          data: {
            comment,
            cost,
            safety,
            fun,
            author: {
              connect: { id: authorId },
            },
            place: {
              create: {
                city,
                country,
              },
            },
          },
        });

        res.json({ result });
      } catch (err) {
        console.log("An error has occured: ", err.message);
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

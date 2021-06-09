import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";
import { pick } from "lodash";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const places = await prisma.place.findMany();
        res.json({ places });
      } catch (err) {
        console.log("An error has occured: ", err.message);
      }
      break;
    case "POST":
      try {
        const values = pick(req.body, ["city", "country", "photoUrl"]);

        const place = await prisma.place.create({
          data: {
            ...values,
          },
        });

        res.json({ place });
      } catch (err) {
        console.log("An error has occured: ", err.message);
      }
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

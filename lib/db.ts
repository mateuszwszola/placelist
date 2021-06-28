import { Place } from '@prisma/client';
import prisma from './prisma';

export type TPlacesWithStats = Place & {
  numberOfReviews: number;
  averageCost: number;
  averageSafety: number;
  averageFun: number;
  score: number;
};

const getPlacesWithStatistics = async (offset = 0, limit = 20): Promise<TPlacesWithStats[]> => {
  const results = await prisma.$queryRaw(`
    SELECT stats.*, place.* FROM "Place" place
    JOIN (SELECT "placeId", 
            count("Review"."id") AS "numberOfReviews",
            round(avg(cost)::numeric, 1) AS "averageCost", 
            round(avg(safety)::numeric, 1) AS "averageSafety", 
            round(avg(fun)::numeric, 1) AS "averageFun",
            round((avg(cost) + avg(safety) + avg(fun) + least(0.01 * count("Review"."id"), 1.0))::numeric, 1) AS "score" 
          FROM "Review"
          GROUP BY "placeId" OFFSET ${offset} LIMIT ${limit}) AS stats
    ON place."id" = stats."placeId"
    ORDER BY stats.score desc;
  `);

  return results;
};

export { getPlacesWithStatistics };

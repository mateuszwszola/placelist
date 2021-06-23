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
            avg(cost) AS "averageCost", 
            avg(safety) AS "averageSafety", 
            avg(fun) AS "averageFun",
            (avg(cost) + avg(safety) + avg(fun) + least(0.01 * count("Review"."id"), 1.0)) AS "score" 
          FROM "Review"
          GROUP BY "placeId" OFFSET ${offset} LIMIT ${limit}) AS stats
    ON place."id" = stats."placeId"
    ORDER BY stats.score desc;
  `);

  return results;
};

export { getPlacesWithStatistics };

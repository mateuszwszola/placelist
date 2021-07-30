import faker from 'faker';
import { Prisma } from '@prisma/client';

export function getRandomReviews(
  authorId: number,
  placeId: number,
  number = 10
): Prisma.ReviewCreateInput[] {
  return Array(number)
    .fill(null)
    .map(() => ({
      author: {
        connect: {
          id: authorId,
        },
      },
      place: {
        connect: {
          id: placeId,
        },
      },
      cost: Math.floor(Math.random() * 10) + 1,
      safety: Math.floor(Math.random() * 10) + 1,
      fun: Math.floor(Math.random() * 10) + 1,
      comment: faker.lorem.words(10),
    }));
}

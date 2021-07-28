import faker from 'faker';
import { Prisma } from '@prisma/client';

export function getRandomUsers(number = 10): Prisma.UserCreateInput[] {
  return Array(number)
    .fill(null)
    .map(() => ({
      name: faker.internet.userName(),
      email: faker.internet.email(),
    }));
}

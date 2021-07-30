import faker from 'faker';
import { Prisma } from '@prisma/client';

export function getRandomPlaces(number = 10): Prisma.PlaceCreateInput[] {
  return Array(number)
    .fill(null)
    .map(() => ({
      city: faker.address.cityName(),
      country: faker.address.country(),
      adminDivision: faker.address.county(),
    }));
}

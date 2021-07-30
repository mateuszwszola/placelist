import { PrismaClient } from '@prisma/client';
import { getRandomPlaces } from './seedData/places';
import { getRandomReviews } from './seedData/reviews';
import { getRandomUsers } from './seedData/users';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const numberOfUsers = 10;
  const numberOfPlaces = 50;
  const reviewsPerPlace = 5;

  const usersData = getRandomUsers(numberOfUsers);
  const users = [];

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: userData,
    });
    users.push(user);
  }

  const placesData = getRandomPlaces(numberOfPlaces);
  const places = [];

  for (const placeData of placesData) {
    const place = await prisma.place.create({
      data: placeData,
    });
    places.push(place);

    const { id: userId } = users[Math.floor(Math.random() * numberOfUsers)];
    const reviewsData = getRandomReviews(userId, place.id, reviewsPerPlace);

    for (const reviewData of reviewsData) {
      await prisma.review.create({
        data: reviewData,
      });
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

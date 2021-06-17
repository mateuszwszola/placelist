/*
  Warnings:

  - The primary key for the `Place` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatarUrl` on the `Profile` table. All the data in the column will be lost.
  - You are about to alter the column `bio` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `placeCity` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `placeCountry` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[city,country]` on the table `Place` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `placeId` to the `Review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_placeCity_placeCountry_fkey";

-- AlterTable
ALTER TABLE "Place" DROP CONSTRAINT "Place_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_pkey",
DROP COLUMN "avatarUrl",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(255),
ADD PRIMARY KEY ("id");
DROP SEQUENCE "Profile_id_seq";

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "placeCity",
DROP COLUMN "placeCountry",
ADD COLUMN     "placeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl",
ADD COLUMN     "image" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "Place.city_country_unique" ON "Place"("city", "country");

-- AddForeignKey
ALTER TABLE "Review" ADD FOREIGN KEY ("placeId") REFERENCES "Place"("id") ON DELETE CASCADE ON UPDATE CASCADE;

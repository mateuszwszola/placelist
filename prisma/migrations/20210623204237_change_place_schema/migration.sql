/*
  Warnings:

  - A unique constraint covering the columns `[geonameId]` on the table `Place` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Place.city_country_unique";

-- AlterTable
ALTER TABLE "Place" ADD COLUMN     "adminDivision" VARCHAR(255),
ADD COLUMN     "geonameId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Place.geonameId_unique" ON "Place"("geonameId");

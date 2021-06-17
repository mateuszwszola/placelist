/*
  Warnings:

  - The primary key for the `Place` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Place` table. All the data in the column will be lost.
  - You are about to alter the column `avatarUrl` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to drop the column `placeId` on the `Review` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `placeCity` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `placeCountry` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_placeId_fkey";

-- AlterTable
ALTER TABLE "Place" DROP CONSTRAINT "Place_pkey",
DROP COLUMN "id",
ALTER COLUMN "photoUrl" DROP NOT NULL,
ADD PRIMARY KEY ("city", "country");

-- AlterTable
ALTER TABLE "Profile" ALTER COLUMN "avatarUrl" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "placeId",
ADD COLUMN     "placeCity" VARCHAR(255) NOT NULL,
ADD COLUMN     "placeCountry" VARCHAR(255) NOT NULL,
ALTER COLUMN "authorId" SET DATA TYPE TEXT,
ALTER COLUMN "comment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "avatarUrl" VARCHAR(255),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refreshToken" TEXT,
    "accessToken" TEXT,
    "accessTokenExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account.providerId_providerAccountId_unique" ON "Account"("providerId", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session.sessionToken_unique" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Session.accessToken_unique" ON "Session"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest.token_unique" ON "VerificationRequest"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest.identifier_token_unique" ON "VerificationRequest"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Review" ADD FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD FOREIGN KEY ("placeCity", "placeCountry") REFERENCES "Place"("city", "country") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

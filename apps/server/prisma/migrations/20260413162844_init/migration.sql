-- CreateTable
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "strikeRate" DOUBLE PRECISION,
    "economy" DOUBLE PRECISION,
    "average" DOUBLE PRECISION,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "privateCode" TEXT,
    "hostName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PRE',
    "bidTimerSec" INTEGER NOT NULL DEFAULT 10,
    "pursePerTeam" DOUBLE PRECISION NOT NULL DEFAULT 150,
    "squadLimit" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_privateCode_key" ON "Room"("privateCode");

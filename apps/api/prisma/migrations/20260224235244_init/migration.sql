-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "photoUrl" TEXT,
    "coins" INTEGER NOT NULL DEFAULT 0,
    "totalDonatedTon" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "walletAddress" TEXT,
    "lastClaimAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotUser" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "coins" INTEGER NOT NULL,
    "avatarUrl" TEXT NOT NULL,

    CONSTRAINT "BotUser_pkey" PRIMARY KEY ("id")
);

-- DropForeignKey
ALTER TABLE "UserTask" DROP CONSTRAINT "UserTask_userId_fkey";

-- CreateTable
CREATE TABLE "Gift" (
    "id" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "tgGiftId" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "emoji" TEXT,
    "starCount" INTEGER NOT NULL DEFAULT 0,
    "isUpgraded" BOOLEAN NOT NULL DEFAULT false,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Gift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessedTx" (
    "txHash" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "amountTon" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedTx_pkey" PRIMARY KEY ("txHash")
);

-- CreateTable
CREATE TABLE "ProcessedUpdate" (
    "updateId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedUpdate_pkey" PRIMARY KEY ("updateId")
);

-- CreateIndex
CREATE INDEX "Gift_userId_idx" ON "Gift"("userId");

-- CreateIndex
CREATE INDEX "User_coins_idx" ON "User"("coins" DESC);

-- AddForeignKey
ALTER TABLE "Gift" ADD CONSTRAINT "Gift_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTask" ADD CONSTRAINT "UserTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "BrainstormRoom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "BrainstormRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainstormIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "contentJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "BrainstormIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainstormMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "BrainstormMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrainstormRoom_updatedAt_idx" ON "BrainstormRoom"("updatedAt");

-- CreateIndex
CREATE INDEX "BrainstormRoom_createdById_idx" ON "BrainstormRoom"("createdById");

-- CreateIndex
CREATE INDEX "BrainstormIdea_roomId_updatedAt_idx" ON "BrainstormIdea"("roomId", "updatedAt");

-- CreateIndex
CREATE INDEX "BrainstormIdea_authorId_idx" ON "BrainstormIdea"("authorId");

-- CreateIndex
CREATE INDEX "BrainstormMessage_roomId_createdAt_idx" ON "BrainstormMessage"("roomId", "createdAt");

-- CreateIndex
CREATE INDEX "BrainstormMessage_authorId_idx" ON "BrainstormMessage"("authorId");

-- AddForeignKey
ALTER TABLE "BrainstormRoom" ADD CONSTRAINT "BrainstormRoom_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrainstormIdea" ADD CONSTRAINT "BrainstormIdea_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "BrainstormRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrainstormIdea" ADD CONSTRAINT "BrainstormIdea_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrainstormMessage" ADD CONSTRAINT "BrainstormMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "BrainstormRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrainstormMessage" ADD CONSTRAINT "BrainstormMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "SharedFolder" (
    "id" TEXT NOT NULL,
    "sharedFolderId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SharedFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_sharedFolderId_key" ON "SharedFolder"("sharedFolderId");

-- AddForeignKey
ALTER TABLE "SharedFolder" ADD CONSTRAINT "SharedFolder_sharedFolderId_fkey" FOREIGN KEY ("sharedFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

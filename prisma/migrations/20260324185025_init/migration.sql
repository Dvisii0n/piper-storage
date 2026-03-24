-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_parentFolderId_fkey";

-- AlterTable
ALTER TABLE "File" ALTER COLUMN "parentFolderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentJson" JSONB,
ALTER COLUMN "content" SET DEFAULT '';

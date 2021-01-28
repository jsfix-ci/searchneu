/*
  Warnings:

  - The migration will change the primary key for the `followed_courses` table. If it partially fails, the table could be left without primary key constraint.
  - The migration will change the primary key for the `followed_sections` table. If it partially fails, the table could be left without primary key constraint.
  - The migration will change the primary key for the `users` table. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `user_id` on the `followed_courses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_id` on the `followed_sections` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "followed_courses" DROP CONSTRAINT "followed_courses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "followed_sections" DROP CONSTRAINT "followed_sections_user_id_fkey";

-- AlterTable
ALTER TABLE "followed_courses" DROP CONSTRAINT "followed_courses_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD PRIMARY KEY ("user_id", "course_hash");

-- AlterTable
ALTER TABLE "followed_sections" DROP CONSTRAINT "followed_sections_pkey",
DROP COLUMN "user_id",
ADD COLUMN     "user_id" INTEGER NOT NULL,
ADD PRIMARY KEY ("user_id", "section_hash");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN "id" SERIAL,
ADD PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "followed_courses" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followed_sections" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

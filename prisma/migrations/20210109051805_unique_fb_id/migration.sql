/*
  Warnings:

  - The migration will add a unique constraint covering the columns `[fb_messenger_id]` on the table `users`. If there are existing duplicate values, the migration will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users.fb_messenger_id_unique" ON "users"("fb_messenger_id");

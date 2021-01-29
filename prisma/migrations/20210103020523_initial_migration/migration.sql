-- CreateTable
CREATE TABLE "followed_courses" (
    "course_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id","course_hash")
);

-- CreateTable
CREATE TABLE "followed_sections" (
    "section_hash" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    PRIMARY KEY ("user_id","section_hash")
);

-- CreateTable
CREATE TABLE "users" (
    "fb_messenger_id" TEXT,
    "first_name" TEXT,
    "id" TEXT NOT NULL,
    "last_name" TEXT,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "followed_courses" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followed_sections" ADD FOREIGN KEY("user_id")REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

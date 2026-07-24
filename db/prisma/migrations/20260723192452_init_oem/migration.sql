-- CreateTable
CREATE TABLE "oem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "trim" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "oem_year_make_model_trim_key" ON "oem"("year", "make", "model", "trim");

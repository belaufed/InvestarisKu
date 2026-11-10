-- CreateTable
CREATE TABLE "Barang" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "lokasi" TEXT NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

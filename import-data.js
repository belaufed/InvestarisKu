
import { PrismaClient } from "@prisma/client";
import fs from "node:fs/promises";

const prisma = new PrismaClient();

async function main() {
  // Membaca data barang dari file JSON
  const isi = await fs.readFile(
    new URL("./data/barang.json", import.meta.url),
    "utf8"
  );

  const barang = JSON.parse(isi);

  // Memastikan database masih kosong
  const jumlahData = await prisma.barang.count();

  if (jumlahData > 0) {
    console.log("Database sudah berisi data. Import dibatalkan.");
    return;
  }

  // Memasukkan seluruh data ke database
  const hasil = await prisma.barang.createMany({
    data: barang.map(({ id, ...item }) => item)
  });

  console.log(`${hasil.count} barang berhasil dimasukkan ke database!`);
}

main()
  .catch((error) => {
    console.error("Gagal mengimpor data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

  
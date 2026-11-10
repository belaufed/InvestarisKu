
import express from "express";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Validasi data barang
function validasiBarang(body) {
  const nama = String(body.nama ?? "").trim();
  const kategori = String(body.kategori ?? "").trim();
  const lokasi = String(body.lokasi ?? "").trim();
  const jumlah = Number(body.jumlah);

  if (
    !nama ||
    !kategori ||
    !lokasi ||
    body.jumlah === "" ||
    body.jumlah === null ||
    body.jumlah === undefined ||
    !Number.isInteger(jumlah) ||
    jumlah < 0
  ) {
    return null;
  }

  return { nama, kategori, jumlah, lokasi };
}

// GET - Menampilkan seluruh barang
app.get("/api/barang", async (req, res, next) => {
  try {
    const barang = await prisma.barang.findMany({
      orderBy: { id: "asc" }
    });

    res.json({
      success: true,
      data: barang
    });
  } catch (error) {
    next(error);
  }
});

// POST - Menambahkan barang
app.post("/api/barang", async (req, res, next) => {
  try {
    const input = validasiBarang(req.body);

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Data barang tidak valid."
      });
    }

    const barangBaru = await prisma.barang.create({
      data: input
    });

    res.status(201).json({
      success: true,
      message: "Barang berhasil ditambahkan.",
      data: barangBaru
    });
  } catch (error) {
    next(error);
  }
});

// PUT - Mengubah barang
app.put("/api/barang/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const input = validasiBarang(req.body);

    if (!Number.isInteger(id) || id <= 0 || !input) {
      return res.status(400).json({
        success: false,
        message: "ID atau data barang tidak valid."
      });
    }

    const barangDiperbarui = await prisma.barang.update({
      where: { id },
      data: input
    });

    res.json({
      success: true,
      message: "Barang berhasil diperbarui.",
      data: barangDiperbarui
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan."
      });
    }

    next(error);
  }
});

// DELETE - Menghapus barang
app.delete("/api/barang/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID barang tidak valid."
      });
    }

    const barangDihapus = await prisma.barang.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: "Barang berhasil dihapus.",
      data: barangDihapus
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Barang tidak ditemukan."
      });
    }

    next(error);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan pada server."
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`InventarisKu berjalan di http://localhost:${PORT}`);
});

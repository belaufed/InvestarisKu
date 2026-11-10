
const API_URL = "/api/barang";

const tabelBarang = document.getElementById("tabelBarang");
const totalJenis = document.getElementById("totalJenis");
const totalStok = document.getElementById("totalStok");
const jumlahData = document.getElementById("jumlahData");
const searchInput = document.getElementById("searchInput");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const barangForm = document.getElementById("barangForm");
const barangId = document.getElementById("barangId");

const namaInput = document.getElementById("nama");
const kategoriInput = document.getElementById("kategori");
const jumlahInput = document.getElementById("jumlah");
const lokasiInput = document.getElementById("lokasi");

const tambahBtn = document.getElementById("tambahBtn");
const closeBtn = document.getElementById("closeBtn");
const batalBtn = document.getElementById("batalBtn");
const simpanBtn = document.getElementById("simpanBtn");
const toast = document.getElementById("toast");

let daftarBarang = [];
let toastTimer;

// Menampilkan notifikasi
function tampilToast(pesan) {
  clearTimeout(toastTimer);
  toast.textContent = pesan;
  toast.classList.remove("hidden");

  toastTimer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Mengamankan teks sebelum dimasukkan ke HTML
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// GET - Mengambil seluruh data dari Express
async function ambilBarang() {
  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("Gagal mengambil data barang.");
    }

    const hasil = await response.json();
    daftarBarang = hasil.data;

    tampilkanBarang();
    updateStatistik();
  } catch (error) {
    tabelBarang.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Gagal memuat data. Pastikan server berjalan.
        </td>
      </tr>
    `;

    tampilToast(error.message);
  }
}

// Menampilkan data pada tabel
function tampilkanBarang() {
  const keyword = searchInput.value.toLowerCase().trim();

  const hasilFilter = daftarBarang.filter((barang) => {
    return (
      barang.nama.toLowerCase().includes(keyword) ||
      barang.kategori.toLowerCase().includes(keyword) ||
      barang.lokasi.toLowerCase().includes(keyword)
    );
  });

  jumlahData.textContent = `${hasilFilter.length} data ditemukan`;

  if (hasilFilter.length === 0) {
    tabelBarang.innerHTML = `
      <tr>
        <td colspan="6" class="empty">
          Tidak ada barang yang ditemukan.
        </td>
      </tr>
    `;
    return;
  }

  tabelBarang.innerHTML = hasilFilter.map((barang) => `
    <tr>
      <td>#${barang.id}</td>
      <td class="item-name">${escapeHTML(barang.nama)}</td>
      <td>
        <span class="category">
          ${escapeHTML(barang.kategori)}
        </span>
      </td>
      <td>${barang.jumlah}</td>
      <td>${escapeHTML(barang.lokasi)}</td>
      <td>
        <button
          class="btn btn-edit"
          data-action="edit"
          data-id="${barang.id}"
        >
          Edit
        </button>
        <button
          class="btn btn-delete"
          data-action="delete"
          data-id="${barang.id}"
        >
          Hapus
        </button>
      </td>
    </tr>
  `).join("");
}

// Menghitung statistik
function updateStatistik() {
  totalJenis.textContent = daftarBarang.length;

  const stok = daftarBarang.reduce((total, barang) => {
    return total + barang.jumlah;
  }, 0);

  totalStok.textContent = stok;
}

// Membuka form tambah barang
function bukaTambah() {
  barangForm.reset();
  barangId.value = "";
  modalTitle.textContent = "Tambah Barang";
  simpanBtn.textContent = "Simpan Barang";
  modal.classList.remove("hidden");
  namaInput.focus();
}

// Membuka form edit barang
function bukaEdit(id) {
  const barang = daftarBarang.find((item) => item.id === id);

  if (!barang) {
    tampilToast("Barang tidak ditemukan.");
    return;
  }

  barangId.value = barang.id;
  namaInput.value = barang.nama;
  kategoriInput.value = barang.kategori;
  jumlahInput.value = barang.jumlah;
  lokasiInput.value = barang.lokasi;

  modalTitle.textContent = "Edit Barang";
  simpanBtn.textContent = "Simpan Perubahan";
  modal.classList.remove("hidden");
  namaInput.focus();
}

// Menutup form
function tutupModal() {
  modal.classList.add("hidden");
  barangForm.reset();
  barangId.value = "";
}

// POST dan PUT
async function simpanData(event) {
  event.preventDefault();

  const id = barangId.value;

  const data = {
    nama: namaInput.value.trim(),
    kategori: kategoriInput.value,
    jumlah: Number(jumlahInput.value),
    lokasi: lokasiInput.value.trim()
  };

  const sedangEdit = id !== "";

  const url = sedangEdit
    ? `${API_URL}/${id}`
    : API_URL;

  const method = sedangEdit ? "PUT" : "POST";

  simpanBtn.disabled = true;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.message || "Gagal menyimpan data.");
    }

    tutupModal();
    await ambilBarang();
    tampilToast(hasil.message);
  } catch (error) {
    tampilToast(error.message);
  } finally {
    simpanBtn.disabled = false;
  }
}

// DELETE - Menghapus barang
async function hapusBarang(id) {
  const barang = daftarBarang.find((item) => item.id === id);

  if (!barang) {
    tampilToast("Barang tidak ditemukan.");
    return;
  }

  const yakin = confirm(
    `Yakin ingin menghapus "${barang.nama}"?`
  );

  if (!yakin) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    const hasil = await response.json();

    if (!response.ok) {
      throw new Error(hasil.message || "Gagal menghapus barang.");
    }

    await ambilBarang();
    tampilToast(hasil.message);
  } catch (error) {
    tampilToast(error.message);
  }
}

// Event tombol pada tabel
tabelBarang.addEventListener("click", (event) => {
  const tombol = event.target.closest("button[data-action]");

  if (!tombol) return;

  const id = Number(tombol.dataset.id);
  const action = tombol.dataset.action;

  if (action === "edit") {
    bukaEdit(id);
  } else if (action === "delete") {
    hapusBarang(id);
  }
});

// Event lainnya
tambahBtn.addEventListener("click", bukaTambah);
closeBtn.addEventListener("click", tutupModal);
batalBtn.addEventListener("click", tutupModal);
barangForm.addEventListener("submit", simpanData);
searchInput.addEventListener("input", tampilkanBarang);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    tutupModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    tutupModal();
  }
});

// Memuat data pertama kali
ambilBarang();

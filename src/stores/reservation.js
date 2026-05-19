export const reservationStore = {
  // Ambil data dari sessionStorage jika ada
  getData() {
    const data = sessionStorage.getItem('reservation_data');
    return data
      ? JSON.parse(data)
      : {
          date: null,
          time: null,
          pax: 1,
          customer: { name: '', phone: '', email: '' },
          preorderMenus: [], // Format cart untuk pre-order
        };
  },

  // Simpan data setiap kali user selesai di satu tahap
  saveData(newData) {
    const current = this.getData();
    sessionStorage.setItem(
      'reservation_data',
      JSON.stringify({ ...current, ...newData }),
    );
  },

  // Hapus saat reservasi sukses atau user batal
  clearData() {
    sessionStorage.removeItem('reservation_data');
  },
};

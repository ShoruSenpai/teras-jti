import Sidebar from '../components/Sidebar';
import { reservationApi } from '../api/reservationApi';

export default function ReservationView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let reservations = [];
  let searchQuery = '';
  let currentFilter = 'All'; // All, Today, This Week, This Month

  const init = async () => {
    container.innerHTML = `
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      </style>

      <div id="sidebar-container"></div>
      
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="bg-main pt-8 px-8 pb-4 flex flex-col z-10">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Reservation List</h1>
              <p class="text-text-body">Manage upcoming bookings and table allocations.</p>
            </div>
            <div class="flex space-x-3">
              <div class="relative w-64">
                <span class="absolute left-3 top-2.5 text-text-body"><i class="fas fa-search"></i></span>
                <input type="text" id="search-input" placeholder="Search reservations..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm bg-surface transition">
              </div>
              
              <div class="relative">
                <select id="date-filter" class="appearance-none pl-10 pr-8 py-2 bg-surface border border-border-base rounded-lg text-text-title font-medium shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-500 transition cursor-pointer">
                  <option value="All">All Time</option>
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                </select>
                <span class="absolute left-3 top-2.5 text-text-body pointer-events-none"><i class="fas fa-filter"></i></span>
                <span class="absolute right-3 top-2.5 text-text-body pointer-events-none"><i class="fas fa-chevron-down text-xs"></i></span>
              </div>
            </div>
          </div>
        </header>

        <div class="flex-1 px-8 pb-8 overflow-hidden flex flex-col">
          <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden flex flex-col h-full">
            <div class="overflow-y-auto custom-scrollbar flex-1 relative">
              <table class="w-full text-left border-collapse">
                <thead class="sticky top-0 bg-surface z-10 shadow-sm">
                  <tr class="border-b border-border-base">
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider bg-surface">Customer</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider bg-surface">Date & Time</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider bg-surface">Details</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider bg-surface">Table Pref.</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider bg-surface text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="reservation-table-body" class="divide-y divide-border-base">
                  <tr>
                    <td colspan="5" class="text-center py-10 text-text-muted">
                      <i class="fas fa-spinner fa-spin text-3xl"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachEvents();

    try {
      reservations = await reservationApi.getReservations();
      renderTable();
    } catch (err) {
      container.querySelector('#reservation-table-body').innerHTML =
        `<tr><td colspan="5" class="text-center py-10 text-status-danger-text font-medium">Gagal memuat data reservasi.</td></tr>`;
    }
  };

  const attachEvents = () => {
    const searchInput = container.querySelector('#search-input');
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderTable();
    });

    const dateFilter = container.querySelector('#date-filter');
    dateFilter.addEventListener('change', (e) => {
      currentFilter = e.target.value;
      renderTable();
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const isDateMatchFilter = (dateString, filter) => {
    if (filter === 'All') return true;

    const resDate = new Date(dateString);
    const today = new Date();

    today.setHours(0, 0, 0, 0);
    const resDateOnly = new Date(
      resDate.getFullYear(),
      resDate.getMonth(),
      resDate.getDate(),
    );

    if (filter === 'Today') {
      return resDateOnly.getTime() === today.getTime();
    }

    if (filter === 'This Week') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return resDateOnly >= startOfWeek && resDateOnly <= endOfWeek;
    }

    if (filter === 'This Month') {
      return (
        resDate.getMonth() === today.getMonth() &&
        resDate.getFullYear() === today.getFullYear()
      );
    }

    return true;
  };

  const renderTable = () => {
    const tbody = container.querySelector('#reservation-table-body');

    // Terapkan Filter & Search sekaligus
    const filteredReservations = reservations.filter((res) => {
      const matchSearch =
        res.customer.toLowerCase().includes(searchQuery) ||
        res.phone.includes(searchQuery);
      const matchDate = isDateMatchFilter(res.date, currentFilter);
      return matchSearch && matchDate;
    });

    if (filteredReservations.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-text-muted font-medium">No reservations found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filteredReservations
      .map((res) => {
        // PERBAIKAN TAMPILAN AKSI: Pisahkan logika untuk Confirmed, Cancelled, dan Pending
        let actionHtml = '';

        if (res.status === 'Confirmed') {
          actionHtml = `<span class="text-status-success-text font-semibold flex items-center justify-end"><i class="far fa-check-circle mr-2"></i> Confirmed</span>`;
        } else if (res.status === 'Cancelled') {
          actionHtml = `<span class="text-status-danger-text font-semibold flex items-center justify-end"><i class="far fa-times-circle mr-2"></i> Cancelled</span>`;
        } else {
          // Jika statusnya pending/lainnya, tampilkan tombol
          actionHtml = `
            <div class="flex justify-end space-x-2">
              <button class="action-btn px-4 py-1.5 rounded-lg border border-border-base text-text-title font-medium hover:bg-gray-50 transition" data-id="${res.id}" data-action="Cancel">Cancel</button>
              <button class="action-btn px-4 py-1.5 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-button transition" data-id="${res.id}" data-action="Confirm">Confirm</button>
            </div>
          `;
        }

        return `
        <tr class="hover:bg-gray-50/50 transition">
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-brand-100 text-brand-500 flex items-center justify-center font-bold text-sm">
                ${getInitials(res.customer)}
              </div>
              <div>
                <p class="font-bold text-text-title">${res.customer}</p>
                <p class="text-xs text-text-body">${res.phone}</p>
              </div>
            </div>
          </td>
          <td class="py-4 px-6">
            <p class="font-medium text-text-title">${res.date}</p>
            <p class="text-sm text-brand-500 font-semibold">${res.time}</p>
          </td>
          <td class="py-4 px-6">
            <div class="flex items-center text-text-title font-medium text-sm">
              <i class="fas fa-user-friends mr-2 text-text-body"></i> ${res.guests} Guests
            </div>
          </td>
          <td class="py-4 px-6">
            <span class="px-3 py-1 bg-main text-text-body font-medium text-sm rounded-full border border-border-base">
              ${res.tablePref}
            </span>
          </td>
          <td class="py-4 px-6 text-right">
            ${actionHtml}
          </td>
        </tr>
      `;
      })
      .join('');

    // Attach Action Events
    tbody.querySelectorAll('.action-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const id = parseInt(btn.dataset.id);
        const action = btn.dataset.action;
        const newStatus = action === 'Confirm' ? 'Confirmed' : 'Cancelled';

        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        btn.disabled = true;

        try {
          await reservationApi.updateReservationStatus(id, newStatus);

          // PERBAIKAN LOGIKA: Cukup update statusnya saja tanpa membuang datanya dari array
          const index = reservations.findIndex((r) => r.id === id);
          if (index > -1) {
            reservations[index].status = newStatus;
          }

          renderTable(); // Gambar ulang tabel
        } catch (error) {
          console.error(error);
          btn.innerHTML = action;
          btn.disabled = false;
        }
      });
    });
  };

  init();

  return container;
}

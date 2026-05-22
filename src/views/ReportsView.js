import Sidebar from '../components/Sidebar.js';
import { dashboardApi } from '../api/dashboardApi.js';
import Chart from 'chart.js/auto';

export default function ReportsView() {
  const container = document.createElement('div');
  // PERBAIKAN 1: Gunakan h-screen agar sidebar terkunci (tidak ikut ter-scroll)
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  // --- STATE MANAGEMENT ---
  let currentFilter = 'all'; // Filter untuk Dashboard (all, today, week, month)
  let currentTxFilter = 'all'; // Filter terpisah khusus untuk halaman View All

  let rawTransactions = []; // Menyimpan data asli dari database
  let currentStats = null;
  let currentTransactions = [];

  // Instance Chart dipisah agar tidak tabrakan
  let dineInChartInstance = null;
  let reservationChartInstance = null;

  // --- FORMATTERS ---
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatShortCurrency = (val) => {
    const num = Number(val) || 0;
    if (num >= 1000000) return 'Rp ' + (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return 'Rp ' + (num / 1000).toFixed(1) + 'k';
    return 'Rp ' + num;
  };

  const formatTxTime = (tx) => {
    const status = (tx.status || '').toUpperCase();
    if (status === 'EXPIRED') return '-';

    let rawDate = tx.time || tx.date || tx.created_at;
    if (status === 'COMPLETED' || status === 'PAID') {
      rawDate = tx.paid_at || tx.time || tx.date || tx.created_at;
    }

    if (!rawDate || rawDate === '-') return '-';

    try {
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return rawDate;

      const dateStr = d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timeStr = d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return `${dateStr}, ${timeStr}`;
    } catch (e) {
      return rawDate;
    }
  };

  // --- CLIENT-SIDE DATE FILTER LOGIC ---
  const filterDataByDate = (dataArray, filterType) => {
    if (filterType === 'all') return dataArray;

    const now = new Date();
    // Reset jam ke 00:00:00 untuk komparasi hari yang akurat
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return dataArray.filter((item) => {
      const itemDateStr =
        item.time || item.date || item.created_at || item.paid_at;
      if (!itemDateStr) return true; // Jika data tidak punya tanggal, tampilkan saja

      const itemDate = new Date(itemDateStr);
      if (isNaN(itemDate)) return true;

      if (filterType === 'today') {
        return itemDate >= startOfToday;
      } else if (filterType === 'week') {
        const oneWeekAgo = new Date(startOfToday);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return itemDate >= oneWeekAgo;
      } else if (filterType === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return itemDate >= startOfMonth;
      }
      return true;
    });
  };

  const init = () => {
    container.innerHTML = `
      <style>
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
      </style>

      <div id="sidebar-container"></div>
      
      <main class="flex-1 h-screen overflow-y-auto relative bg-main custom-scrollbar">
        
        <div id="dashboard-view" class="p-8 block">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Sales Summary</h1>
              <p class="text-text-body">Overview of restaurant performance</p>
            </div>
            <div class="flex space-x-3">
              <div class="relative">
                <select id="date-filter" class="appearance-none px-4 py-2 pr-10 bg-surface border border-border-base rounded-lg text-text-title font-medium shadow-card focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition">
                  <option value="all" selected>All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <i class="fas fa-chevron-down absolute right-4 top-3 text-xs text-text-body pointer-events-none"></i>
              </div>
              <button id="export-btn" class="px-4 py-2 bg-text-title text-white rounded-lg font-medium shadow-card flex items-center hover:bg-gray-800 transition">
                <i class="fas fa-download mr-2"></i> Export CSV
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" id="kpi-container"></div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-text-title">Dine-In Revenue</h3>
              </div>
              <div class="relative h-56 w-full" id="chart-dinein-container">
                <canvas id="dineInChart"></canvas>
              </div>
            </div>

            <div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card">
              <div class="flex justify-between items-center mb-6">
                <h3 class="text-lg font-bold text-text-title">Reservation Revenue</h3>
              </div>
              <div class="relative h-56 w-full" id="chart-reservation-container">
                <canvas id="reservationChart"></canvas>
              </div>
            </div>
          </div>

          <div class="bg-surface rounded-2xl border border-border-base shadow-card overflow-hidden flex flex-col mb-8">
            <div class="p-5 border-b border-border-base flex justify-between items-center bg-surface">
              <h3 class="text-lg font-bold text-text-title">Recent Transactions</h3>
              <button id="view-all-btn" class="text-brand-500 text-sm font-semibold hover:underline">View All</button>
            </div>
            <div class="p-2 overflow-y-auto custom-scrollbar" id="recent-tx-container"></div>
          </div>
        </div>

        <div id="all-transactions-view" class="p-8 hidden animate-[fadeIn_0.3s_ease-in-out]">
          <button id="back-btn" class="mb-6 px-4 py-2 bg-surface border border-border-base rounded-lg text-text-title font-medium shadow-sm hover:bg-gray-50 transition flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Back to Dashboard
          </button>
          
          <div class="bg-surface rounded-2xl border border-border-base shadow-card overflow-hidden flex flex-col h-[75vh]">
            <div class="p-6 border-b border-border-base flex justify-between items-center bg-surface shrink-0">
              <div>
                <h2 class="text-2xl font-bold text-text-title">All Transactions</h2>
                <p class="text-sm text-text-body">Manage and view all records</p>
              </div>
              
              <div class="relative">
                <select id="tx-date-filter" class="appearance-none px-4 py-2 pr-10 bg-surface border border-border-base rounded-lg text-text-title font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer transition">
                  <option value="all" selected>All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <i class="fas fa-chevron-down absolute right-4 top-3 text-xs text-text-body pointer-events-none"></i>
              </div>
            </div>
            <div class="p-0 flex-1 overflow-y-auto custom-scrollbar relative" id="full-tx-container"></div>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachEvents();
    fetchAndRenderData();
  };

  const renderSkeletons = () => {
    container.querySelector('#kpi-container').innerHTML = Array(4)
      .fill(
        `<div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card h-32 animate-pulse flex flex-col justify-between">
        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div class="w-1/2 h-4 bg-gray-200 rounded mt-4"></div>
        <div class="w-3/4 h-8 bg-gray-200 rounded mt-2"></div>
      </div>`,
      )
      .join('');

    container.querySelector('#recent-tx-container').innerHTML = Array(3)
      .fill(
        `<div class="flex items-center justify-between p-3 border-b border-gray-50 animate-pulse">
        <div class="flex items-center"><div class="w-10 h-10 bg-gray-200 rounded-full mr-3"></div><div class="w-20 h-4 bg-gray-200 rounded"></div></div>
        <div class="w-16 h-6 bg-gray-200 rounded"></div>
      </div>`,
      )
      .join('');

    container.querySelector('#chart-dinein-container').innerHTML =
      `<div class="w-full h-full bg-gray-100 rounded-lg animate-pulse"></div>`;
    container.querySelector('#chart-reservation-container').innerHTML =
      `<div class="w-full h-full bg-gray-100 rounded-lg animate-pulse"></div>`;
  };

  const fetchAndRenderData = async () => {
    renderSkeletons();

    try {
      // Fetch dari API
      currentStats = await dashboardApi.getStats();
      rawTransactions = await dashboardApi.getTransactions();

      // Gunakan JS Filter untuk memotong data sesuai opsi tanggal
      currentTransactions = filterDataByDate(rawTransactions, currentFilter);

      renderKPIs();
      renderRecentTransactions();
      renderFullTransactions(); // Akan merender menggunakan currentTxFilter
      renderCharts();
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
      container.querySelector('#kpi-container').innerHTML =
        `<p class="text-red-500 font-bold p-4">Gagal memuat data. Periksa koneksi backend.</p>`;
    }
  };

  const renderKPIs = () => {
    // Karena stats butuh hitungan backend, idealnya stats di-fetch dengan param ?filter=week
    // Untuk saat ini kita pakai data currentStats (Anda bisa mengubah ini nanti di Backend Laravel)
    container.querySelector('#kpi-container').innerHTML = `
      <div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <div class="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-500"><i class="fas fa-money-bill-wave"></i></div>
          <span class="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-md">${currentStats.revenueTrend || '+0%'}</span>
        </div>
        <p class="text-xs text-text-body font-bold uppercase tracking-wider mb-1">Total Revenue</p>
        <h2 class="text-2xl font-bold text-text-title">${formatShortCurrency(currentStats.revenue)}</h2>
      </div>

      <div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text-body"><i class="fas fa-receipt"></i></div>
          <span class="px-2 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-md">${currentStats.ordersTrend || '+0%'}</span>
        </div>
        <p class="text-xs text-text-body font-bold uppercase tracking-wider mb-1">Total Orders</p>
        <h2 class="text-2xl font-bold text-text-title">${currentStats.orders?.toLocaleString('id-ID') || 0}</h2>
      </div>

      <div class="bg-surface p-6 rounded-2xl border border-border-base shadow-card flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text-body"><i class="fas fa-chart-line"></i></div>
          <span class="px-2 py-1 bg-gray-100 text-text-body text-xs font-bold rounded-md">${currentStats.avgOrderTrend || '-'}</span>
        </div>
        <p class="text-xs text-text-body font-bold uppercase tracking-wider mb-1">Avg Order Value</p>
        <h2 class="text-2xl font-bold text-text-title">${formatShortCurrency(currentStats.avgOrder)}</h2>
      </div>

      <div class="bg-brand-500 p-6 rounded-2xl shadow-card flex flex-col relative overflow-hidden group hover:bg-brand-600 transition cursor-pointer">
        <div class="absolute -right-4 -top-4 text-white opacity-10 text-7xl transform rotate-12 group-hover:scale-110 transition duration-300"><i class="fas fa-fire"></i></div>
        <div class="flex justify-between items-start mb-4 relative z-10">
          <div class="w-10 h-10 rounded-full bg-surface/20 flex items-center justify-center text-white"><i class="fas fa-fire"></i></div>
        </div>
        <p class="text-xs text-white/80 font-bold uppercase tracking-wider mb-1 relative z-10">Active Orders</p>
        <h2 class="text-3xl font-bold text-white mb-2 relative z-10">${currentStats.activeOrders || 0}</h2>
        <div class="text-white text-sm font-medium mt-auto flex items-center relative z-10">
          Akan dikerjakan nanti <i class="fas fa-arrow-right ml-2 text-xs"></i>
        </div>
      </div>
    `;
  };

  const getStatusBadge = (status) => {
    status = (status || '').toUpperCase();
    if (status === 'COMPLETED' || status === 'PAID')
      return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-status-success-bg text-status-success-text">${status}</span>`;
    if (status === 'CANCELLED')
      return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-status-danger-bg text-status-danger-text">${status}</span>`;
    return `<span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-text-body">${status}</span>`;
  };

  const renderRecentTransactions = () => {
    const txContainer = container.querySelector('#recent-tx-container');

    if (currentTransactions.length === 0) {
      txContainer.innerHTML = `<p class="p-4 text-center text-sm text-text-muted">No transactions found for this period.</p>`;
      return;
    }

    const recentTx = currentTransactions.slice(0, 3);
    txContainer.innerHTML = recentTx
      .map(
        (tx) => `
      <div class="flex items-center justify-between p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg transition">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-500 mr-3"><i class="fas fa-receipt"></i></div>
          <div>
            <p class="text-sm font-bold text-text-title">${tx.id || tx.token}</p>
            <p class="text-xs text-text-body">Table ${tx.table || tx.type || '-'}</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-text-title mb-1">${formatCurrency(tx.amount || tx.total)}</p>
          ${getStatusBadge(tx.status)}
        </div>
      </div>
    `,
      )
      .join('');
  };

  const renderFullTransactions = () => {
    const fullContainer = container.querySelector('#full-tx-container');

    // Filter khusus untuk view table panjang
    const filteredFullTx = filterDataByDate(rawTransactions, currentTxFilter);

    if (filteredFullTx.length === 0) {
      fullContainer.innerHTML = `<p class="text-center text-text-muted py-10">No transactions in this period.</p>`;
      return;
    }

    fullContainer.innerHTML = `
      <table class="w-full text-left border-collapse">
        <thead class="sticky top-0 bg-surface z-10 shadow-sm">
          <tr class="border-b border-border-base text-xs text-text-body uppercase tracking-wider">
            <th class="py-4 px-6 bg-surface">Order ID</th>
            <th class="py-4 px-6 bg-surface">Table / Type</th>
            <th class="py-4 px-6 bg-surface">Time</th>
            <th class="py-4 px-6 bg-surface">Amount</th>
            <th class="py-4 px-6 bg-surface text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          ${filteredFullTx
            .map(
              (tx) => `
            <tr class="hover:bg-gray-50 transition">
              <td class="py-4 px-6 font-bold text-brand-500">${tx.id || tx.token}</td>
              <td class="py-4 px-6 text-text-title font-medium">${tx.table || tx.type || '-'}</td>
              <td class="py-4 px-6 text-text-body text-sm">${formatTxTime(tx)}</td>
              <td class="py-4 px-6 text-text-title font-bold">${formatCurrency(tx.amount || tx.total)}</td>
              <td class="py-4 px-6 text-right">${getStatusBadge(tx.status)}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    `;
  };

  const renderCharts = () => {
    const dineInContainer = container.querySelector('#chart-dinein-container');
    const resContainer = container.querySelector(
      '#chart-reservation-container',
    );

    dineInContainer.innerHTML = `<canvas id="dineInChart"></canvas>`;
    resContainer.innerHTML = `<canvas id="reservationChart"></canvas>`;

    const ctxDineIn = document.getElementById('dineInChart').getContext('2d');
    const ctxRes = document.getElementById('reservationChart').getContext('2d');

    if (dineInChartInstance) dineInChartInstance.destroy();
    if (reservationChartInstance) reservationChartInstance.destroy();

    // Mapping Real Data Fallback (Jika API Backend mu mengirim chartDineIn / chartReservation)
    const labels = currentStats.chartLabels || [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ];
    const dineInData = currentStats.chartDineIn || [10, 20, 15, 30, 25, 40, 35];
    const resData = currentStats.chartReservation || [5, 12, 8, 15, 10, 20, 18];

    // Chart 1: Dine In
    dineInChartInstance = new Chart(ctxDineIn, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Dine-In',
            data: dineInData,
            borderColor: '#A93226',
            backgroundColor: 'rgba(169, 50, 38, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { borderDash: [5, 5] }, ticks: { display: false } },
        },
      },
    });

    // Chart 2: Reservation
    reservationChartInstance = new Chart(ctxRes, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Reservation',
            data: resData,
            borderColor: '#E67E22', // Warna beda (Oranye) untuk reservasi
            backgroundColor: 'rgba(230, 126, 34, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { borderDash: [5, 5] }, ticks: { display: false } },
        },
      },
    });
  };

  const exportToCSV = () => {
    // Kita ekspor data sesuai filter dashboard (currentTransactions)
    if (currentTransactions.length === 0) {
      Swal.fire(
        'Info',
        'Tidak ada data transaksi untuk diekspor pada rentang waktu ini.',
        'info',
      );
      return;
    }

    const headers = [
      'Order ID',
      'Table/Type',
      'Time/Date',
      'Total Amount',
      'Status',
    ];

    const csvRows = currentTransactions.map((tx) => {
      const safeAmount = Number(tx.amount || tx.total) || 0;
      return [
        tx.id || tx.token,
        tx.table || tx.type || '-',
        formatTxTime(tx).replace(/,/g, ''),
        safeAmount,
        tx.status,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = `TerasJTI_Report_${currentFilter}_${new Date().getTime()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const attachEvents = () => {
    const dashboardView = container.querySelector('#dashboard-view');
    const allTxView = container.querySelector('#all-transactions-view');

    // Filter Utama Dashboard (Filter Grafik dan Data Kecil)
    container.querySelector('#date-filter').addEventListener('change', (e) => {
      currentFilter = e.target.value;
      // Filter list dari raw data tanpa hit backend berulang kali
      currentTransactions = filterDataByDate(rawTransactions, currentFilter);

      // Jika Backend Anda cerdas, ganti 2 baris di atas dengan:
      // fetchAndRenderData()
      // agar KPI dan Chart juga terupdate dari hitungan Database MySQL

      renderRecentTransactions();
    });

    // Filter Khusus Halaman View All Transactions
    container
      .querySelector('#tx-date-filter')
      .addEventListener('change', (e) => {
        currentTxFilter = e.target.value;
        renderFullTransactions();
      });

    container
      .querySelector('#export-btn')
      .addEventListener('click', exportToCSV);

    container.querySelector('#view-all-btn').addEventListener('click', (e) => {
      e.preventDefault();
      dashboardView.classList.add('hidden');
      allTxView.classList.remove('hidden');
      // Otomatis sinkronkan filter View All dengan filter Dashboard
      currentTxFilter = currentFilter;
      container.querySelector('#tx-date-filter').value = currentTxFilter;
      renderFullTransactions();
    });

    container.querySelector('#back-btn').addEventListener('click', () => {
      allTxView.classList.add('hidden');
      dashboardView.classList.remove('hidden');
    });
  };

  init();
  return container;
}

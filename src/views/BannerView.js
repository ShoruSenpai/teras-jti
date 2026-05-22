import Sidebar from '../components/Sidebar.js';
import BannerPopup from '../components/BannerPopup.js';
import { bannerApi } from '../api/bannerApi.js'; // Gunakan bannerApi
import Swal from 'sweetalert2';

export default function BannerView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let banners = [];
  let statusFilter = 'all';
  let sortBy = 'display_order';

  const init = async () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>

      <main class="flex-1 flex flex-col h-screen overflow-hidden relative bg-main">
        <header class="pt-8 px-8 pb-4 flex flex-col flex-shrink-0 z-20">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Banner Management</h1>
              <p class="text-text-body">Promotional assets and dashboard displays.</p>
            </div>
            <button id="create-banner-btn" class="px-5 py-2.5 bg-brand-500 text-white rounded-xl font-bold shadow-button flex items-center hover:bg-brand-600 transition">
              <i class="fas fa-plus mr-2"></i> Create New Banner
            </button>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex gap-3">
              <div class="relative ">
                <span class="absolute left-3 top-2.5 text-brand-500"><i class="fas fa-filter text-xs"></i></span>
                <select id="status-filter" class="appearance-none pl-9 pr-10 py-2 bg-brand-50 border border-brand-100 rounded-lg text-brand-500 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer text-sm">
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
                <span class="absolute right-3 top-3 text-brand-500 pointer-events-none"><i class="fas fa-chevron-down text-xs"></i></span>
              </div>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-brand-500"><i class="fas fa-sort text-xs"></i></span>
                <select id="sort-by" class="appearance-none pl-9 pr-10 py-2 bg-brand-50 border border-brand-100 rounded-lg text-brand-500 font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer text-sm">
                  <option value="display_order">Sort: Display Order</option>
                  <option value="newest">Sort: Newest First</option>
                </select>
                <span class="absolute right-3 top-3 text-brand-500 pointer-events-none"><i class="fas fa-chevron-down text-xs"></i></span>
              </div>
            </div>
            <p id="active-count" class="text-sm text-text-body font-medium"></p>
          </div>
        </header>

        <div class="flex-1 overflow-hidden px-8 pb-8 pt-2 flex flex-col">
          <div class="bg-surface rounded-2xl shadow-card border border-border-base flex-1 overflow-hidden flex flex-col relative">
            
            <div class="flex-1 overflow-y-auto custom-scrollbar">
              <table class="w-full text-left border-collapse relative">
                <thead class="sticky top-0 z-10">
                  <tr class="border-b border-border-base bg-gray-50/95 backdrop-blur-sm shadow-sm">
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider w-[120px]">Status</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider w-[100px] text-center">Order</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider w-[200px]">Preview</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider">Title & Date</th>
                    <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody id="banner-table-body" class="divide-y divide-border-base">
                  <tr>
                    <td colspan="5" class="text-center py-20 text-brand-500">
                      <i class="fas fa-spinner fa-spin text-4xl"></i>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div id="pagination-footer" class="p-4 border-t border-border-base bg-surface flex items-center justify-between text-sm text-text-body shrink-0 z-10"></div>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachHeaderEvents();

    // Fetch data via bannerApi
    banners = await bannerApi.getBanners();
    renderTable();
  };

  const getFilteredBanners = () => {
    let filtered = [...banners];

    if (statusFilter === 'active')
      filtered = filtered.filter((b) => b.is_active);
    if (statusFilter === 'inactive')
      filtered = filtered.filter((b) => !b.is_active);

    if (sortBy === 'display_order') {
      filtered.sort((a, b) => a.display_order - b.display_order);
    } else {
      // Pastikan property ini bernama 'created_at' di respons API
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  const renderTable = () => {
    const tbody = container.querySelector('#banner-table-body');
    const filtered = getFilteredBanners();
    const activeCount = banners.filter((b) => b.is_active).length;

    container.querySelector('#active-count').textContent =
      `Showing ${activeCount} Active Banner${activeCount !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center py-20 text-text-muted"><i class="fas fa-images text-4xl mb-3 opacity-50"></i><p class="font-medium">No banners found.</p></td></tr>`;
      container.querySelector('#pagination-footer').innerHTML = '';
      return;
    }

    tbody.innerHTML = filtered
      .map((b) => {
        // Logika Kedaluwarsa
        const isExpired = b.end_at && new Date(b.end_at) < new Date();

        // Ambil boolean (karena MySQL kadang mengirimkan 1/0, pastikan kita casting)
        const isActive = !!b.is_active;

        return `
        <tr class="hover:bg-gray-50/50 transition group">
          <td class="py-4 px-6 align-middle">
            <label class="flex items-center cursor-pointer gap-2">
              <div class="relative toggle-wrapper" data-id="${b.banner_id}">
                <input type="checkbox" ${isActive ? 'checked' : ''} class="sr-only peer toggle-checkbox">
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-500 transition-colors"></div>
                <div class="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
              </div>
              <span class="text-xs font-bold uppercase tracking-wider ${isActive ? 'text-brand-500' : 'text-text-muted'}">${isActive ? 'ON' : 'OFF'}</span>
            </label>
          </td>

          <td class="py-4 px-6 text-center align-middle">
            <span class="text-lg font-bold text-text-title bg-gray-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto">${b.display_order}</span>
          </td>

          <td class="py-4 px-6 align-middle">
            <div class="w-32 h-16 rounded-lg overflow-hidden border border-border-base bg-gray-100 shadow-sm ${!isActive ? 'opacity-60 grayscale-[40%]' : ''}">
              <img src="${b.image_url}" alt="Banner" class="w-full h-full object-cover">
            </div>
          </td>

          <td class="py-4 px-6 align-middle">
            <p class="font-bold text-text-title ${!isActive ? 'opacity-60' : ''}">${b.banner_title}</p>
            ${b.start_at || b.end_at ? `<p class="text-xs text-text-body mt-1"><i class="far fa-calendar-alt mr-1"></i> ${b.start_at || 'Now'} — ${b.end_at || 'Forever'}</p>` : ''}
            ${isExpired ? '<p class="text-xs text-status-danger-text font-bold mt-1"><i class="fas fa-exclamation-circle mr-1"></i> Expired</p>' : ''}
          </td>

          <td class="py-4 px-6 text-right align-middle">
            <div class="flex justify-end space-x-2">
              <button class="edit-btn w-8 h-8 rounded-lg bg-gray-100 text-text-body hover:text-brand-500 hover:bg-brand-50 transition flex items-center justify-center" data-id="${b.banner_id}" title="Edit">
                <i class="fas fa-pencil-alt text-sm pointer-events-none"></i>
              </button>
              <button class="del-btn w-8 h-8 rounded-lg bg-gray-100 text-text-body hover:text-status-danger-text hover:bg-status-danger-bg transition flex items-center justify-center" data-id="${b.banner_id}" title="Delete">
                <i class="far fa-trash-alt text-sm pointer-events-none"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
      })
      .join('');

    // Pagination Display
    container.querySelector('#pagination-footer').innerHTML = `
      <span>Showing 1-${filtered.length} of ${filtered.length} banners</span>
      <div class="flex gap-1">
        <button class="w-8 h-8 rounded-lg border border-border-base text-text-muted flex items-center justify-center" disabled><i class="fas fa-chevron-left text-xs"></i></button>
        <button class="w-8 h-8 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center shadow-sm text-sm">1</button>
        <button class="w-8 h-8 rounded-lg border border-border-base text-text-muted flex items-center justify-center" disabled><i class="fas fa-chevron-right text-xs"></i></button>
      </div>
    `;

    attachTableEvents();
  };

  const attachHeaderEvents = () => {
    container
      .querySelector('#create-banner-btn')
      .addEventListener('click', () => {
        const popup = BannerPopup(null, async () => {
          banners = await bannerApi.getBanners(); // Gunakan API baru
          renderTable();
        });
        document.body.appendChild(popup);
      });

    container
      .querySelector('#status-filter')
      .addEventListener('change', (e) => {
        statusFilter = e.target.value;
        renderTable();
      });

    container.querySelector('#sort-by').addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderTable();
    });
  };

  const attachTableEvents = () => {
    const tbody = container.querySelector('#banner-table-body');

    // Toggle Status (On/Off)
    tbody.querySelectorAll('.toggle-wrapper').forEach((wrapper) => {
      wrapper.addEventListener('click', async (e) => {
        e.preventDefault(); // Mencegah checkbox tercentang dua kali oleh browser
        const id = parseInt(wrapper.dataset.id);

        try {
          await bannerApi.toggleBannerStatus(id); // Hit endpoint toggle API
          banners = await bannerApi.getBanners(); // Tarik data ulang
          renderTable();
        } catch (error) {
          console.error('Gagal mengubah status banner', error);
          Swal.fire('Error', 'Gagal merubah status banner.', 'error');
        }
      });
    });

    // Edit Banner
    tbody.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        const banner = banners.find((b) => b.banner_id === id);

        if (banner) {
          const popup = BannerPopup(banner, async () => {
            banners = await bannerApi.getBanners();
            renderTable();
          });
          document.body.appendChild(popup);
        }
      });
    });

    // Delete Banner
    tbody.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const targetBtn = e.currentTarget;
        const id = parseInt(targetBtn.dataset.id);

        Swal.fire({
          title: 'Hapus Banner?',
          text: 'Banner yang dihapus tidak bisa dikembalikan!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#E74C3C',
          confirmButtonText: 'Ya, Hapus!',
        }).then(async (result) => {
          if (result.isConfirmed) {
            targetBtn.innerHTML =
              '<i class="fas fa-spinner fa-spin text-sm"></i>';
            targetBtn.disabled = true;

            try {
              await bannerApi.deleteBanner(id);
              banners = banners.filter((b) => b.banner_id !== id);
              renderTable();
              Swal.fire('Terhapus!', 'Banner berhasil dihapus.', 'success');
            } catch (err) {
              console.error(err);
              Swal.fire('Gagal', 'Tidak dapat menghapus banner.', 'error');
              targetBtn.innerHTML = '<i class="far fa-trash-alt text-sm"></i>';
              targetBtn.disabled = false;
            }
          }
        });
      });
    });
  };

  init();
  return container;
}

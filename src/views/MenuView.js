import Sidebar from '../components/Sidebar.js';
import MenuPopup from '../components/MenuPopup.js';
import { menuApi } from '../api/menuApi.js';

export default function MenuView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let menuItems = [];
  let currentCategory = 'All Categories';
  let dynamicCategories = [];
  let searchQuery = '';

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const init = async () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative" id="main-content">
        <div class="flex items-center justify-center h-full text-brand-500"><i class="fas fa-spinner fa-spin text-4xl"></i></div>
      </main>
    `;
    container.querySelector('#sidebar-container').appendChild(Sidebar());

    menuItems = await menuApi.getMenu();

    const allCats = menuItems.map((item) => item.category);
    dynamicCategories = [...new Set(allCats)];

    renderFullUI();
  };

  const renderFullUI = () => {
    const mainContent = container.querySelector('#main-content');

    const categoryOptions = dynamicCategories
      .map(
        (cat) =>
          `<option value="${cat}" ${currentCategory === cat ? 'selected' : ''}>${cat}</option>`,
      )
      .join('');

    mainContent.innerHTML = `
        <header class="bg-main pt-8 px-8 pb-4 flex flex-col z-10 border-b border-border-base">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Menu List</h1>
              <p class="text-text-body">Manage restaurant offerings, categories, and availability.</p>
            </div>
            <div class="flex flex-col items-end gap-3">
              <div class="flex gap-3">
                <div class="relative w-64">
                  <span class="absolute left-3 top-2.5 text-text-body"><i class="fas fa-search"></i></span>
                  <input type="text" id="search-input" value="${searchQuery}" placeholder="Search menu..." class="w-full pl-10 pr-4 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm bg-surface">
                </div>
                <div class="relative">
                  <select id="cat-filter" class="appearance-none pl-4 pr-10 py-2 bg-surface border border-border-base rounded-lg text-text-title font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer">
                    <option value="All Categories">All Categories</option>
                    ${categoryOptions}
                  </select>
                  <span class="absolute right-3 top-3 text-text-body pointer-events-none"><i class="fas fa-chevron-down text-xs"></i></span>
                </div>
              </div>
              <button id="add-new-btn" class="px-5 py-2.5 bg-brand-500 text-white rounded-lg font-medium shadow-button flex items-center hover:bg-brand-600 transition">
                <i class="fas fa-plus mr-2"></i> Add New Item
              </button>
            </div>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8" id="menu-grid-container"></div>
    `;

    attachHeaderEvents();
    renderGrid();
  };

  const renderGrid = () => {
    const gridContainer = container.querySelector('#menu-grid-container');

    let filteredItems = menuItems;
    if (currentCategory !== 'All Categories') {
      filteredItems = filteredItems.filter(
        (i) => i.category === currentCategory,
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredItems = filteredItems.filter((i) =>
        (i.name || '').toLowerCase().includes(q),
      );
    }

    if (filteredItems.length === 0) {
      gridContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-text-muted">
          <i class="fas fa-book-open text-5xl mb-4"></i>
          <p class="font-medium text-lg">No menu items found.</p>
        </div>
      `;
      return;
    }

    gridContainer.innerHTML = `
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7 gap-4">
        ${filteredItems
          .map((item) => {
            let badgeHtml = '';
            let opacityClass = '';

            const displayStatus =
              item.status === 'available'
                ? 'Available'
                : item.status === 'sold_out'
                  ? 'Out of Stock'
                  : 'Disabled';

            if (displayStatus === 'Available') {
              badgeHtml = `<span class="absolute top-2 right-2 bg-surface text-status-success-text px-2 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center"><span class="w-1.5 h-1.5 rounded-full bg-status-success-text mr-1"></span> Available</span>`;
            } else if (displayStatus === 'Out of Stock') {
              badgeHtml = `<span class="absolute top-2 right-2 bg-surface/90 text-status-danger-text px-2 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center border border-status-danger-text/20"><i class="fas fa-ban mr-1"></i> Out of Stock</span>`;
              opacityClass = 'opacity-80 grayscale-[30%]';
            } else {
              badgeHtml = `<span class="absolute top-2 right-2 bg-surface/90 text-text-muted px-2 py-1 rounded-md text-[10px] font-bold shadow-sm flex items-center border border-border-base"><i class="far fa-eye-slash mr-1"></i> Disabled</span>`;
              opacityClass = 'opacity-60 grayscale-[50%]';
            }

            return `
            <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden flex flex-col hover:shadow-modal transition group ${opacityClass}">
              <div class="w-full aspect-square relative bg-gray-100 overflow-hidden">
                <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                ${badgeHtml}
              </div>
              <div class="p-4 flex flex-col flex-1 h-auto min-h-[120px]">
                <h3 class="font-bold text-text-title text-xs leading-tight mb-1 line-clamp-2">${item.name}</h3>
                <span class="inline-block px-2 py-0.5 bg-gray-100 text-text-body text-[10px] rounded-full w-max mb-auto">${item.category}</span>
                <div class="flex flex-col gap-3 justify-between items-start mt-4 pt-3 border-t border-border-base">
                  <span class="font-bold text-text-title text-sm">${formatCurrency(item.price)}</span>
                  <div class="flex justify-end w-full gap-2">
                    <button class="edit-btn w-7 h-7 rounded-lg bg-gray-100 text-text-body hover:text-brand-500 hover:bg-brand-50 transition flex items-center justify-center" data-id="${item.id}" title="Edit">
                      <i class="fas fa-pencil-alt text-xs pointer-events-none"></i>
                    </button>
                    <button class="del-btn w-7 h-7 rounded-lg bg-gray-100 text-text-body hover:text-status-danger-text hover:bg-status-danger-bg transition flex items-center justify-center" data-id="${item.id}" title="Delete">
                      <i class="far fa-trash-alt text-xs pointer-events-none"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `;
          })
          .join('')}
      </div>
    `;

    attachCardEvents();
  };

  const attachHeaderEvents = () => {
    container.querySelector('#search-input').addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderGrid();
    });

    container.querySelector('#cat-filter').addEventListener('change', (e) => {
      currentCategory = e.target.value;
      renderGrid();
    });

    container.querySelector('#add-new-btn').addEventListener('click', () => {
      // Lempar dynamicCategories agar popup tahu pilihan kategorinya
      const popup = MenuPopup(null, dynamicCategories, async () => {
        menuItems = await menuApi.getMenu();

        // Refresh kategori dinamis jika ada kategori baru
        const allCats = menuItems.map((item) => item.category);
        dynamicCategories = [...new Set(allCats)];

        renderFullUI(); // Render ulang seluruh UI agar dropdown update
      });
      document.body.appendChild(popup);
    });
  };

  const attachCardEvents = () => {
    const grid = container.querySelector('#menu-grid-container');

    grid.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        const item = menuItems.find((i) => i.id === id);
        if (item) {
          const popup = MenuPopup(item, dynamicCategories, async () => {
            menuItems = await menuApi.getMenu();
            renderFullUI();
          });
          document.body.appendChild(popup);
        }
      });
    });

    grid.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this menu item?')) {
          const targetBtn = e.currentTarget;
          const id = parseInt(targetBtn.dataset.id);
          const icon = targetBtn.querySelector('i');

          icon.className = 'fas fa-spinner fa-spin text-xs';
          targetBtn.disabled = true;

          try {
            await menuApi.deleteMenuItem(id);
            menuItems = menuItems.filter((i) => i.id !== id);
            renderGrid();
          } catch (err) {
            console.error(err);
            alert('Gagal menghapus menu.');
            icon.className = 'far fa-trash-alt text-xs';
            targetBtn.disabled = false;
          }
        }
      });
    });
  };

  init();

  return container;
}

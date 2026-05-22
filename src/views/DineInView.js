import Sidebar from '../components/Sidebar';
import { orderApi } from '../api/orderApi';

export default function DineInView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let orders = [];
  let currentFilter = 'All'; // All, Pending, Paid, Cancelled, Expired

  const formatCurrency = (val) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);

  const init = async () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>
      
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="bg-main pt-8 px-8 pb-4 flex flex-col z-10 border-b border-border-base">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Dine In Orders</h1>
              <p class="text-text-body">Live preview of all active orders from customers.</p>
            </div>
            <button id="refresh-btn" class="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium shadow-button flex items-center hover:bg-brand-600 transition">
              <i class="fas fa-sync-alt mr-2"></i> <span>Refresh</span>
            </button>
          </div>
          
          <!-- Filters -->
          <div class="flex space-x-2 overflow-x-auto pb-2" id="filter-tabs">
            ${['All', 'Pending', 'Paid', 'Cancelled', 'Expired']
              .map(
                (filter) => `
              <button data-filter="${filter}" class="filter-btn px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border shadow-sm
                ${currentFilter === filter ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface text-text-body border-border-base hover:bg-gray-50'}">
                ${filter}
              </button>
            `,
              )
              .join('')}
          </div>
        </header>

        <div class="flex-1 overflow-y-auto p-8" id="orders-container">
          <div class="flex items-center justify-center h-full text-text-body">
            <i class="fas fa-spinner fa-spin text-3xl"></i>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());
    attachFilterEvents();

    const refreshBtn = container.querySelector('#refresh-btn');
    refreshBtn.addEventListener('click', () => {
      fetchOrders();
    });

    fetchOrders();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-status-warning-bg text-status-warning-text';
      case 'paid':
        return 'bg-status-success-bg text-status-success-text';
      case 'cancelled':
        return 'bg-status-danger-bg text-status-danger-text';
      case 'expired':
        return 'bg-status-purple-bg text-status-purple-text';
      default:
        return 'bg-gray-100 text-text-body';
    }
  };

  const renderOrders = () => {
    const ordersContainer = container.querySelector('#orders-container');

    const filteredOrders =
      currentFilter === 'All'
        ? orders
        : orders.filter(
            (o) => o.status.toLowerCase() === currentFilter.toLowerCase(),
          );

    if (filteredOrders.length === 0) {
      ordersContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center text-center text-text-muted">
          <i class="fas fa-receipt text-5xl mb-4"></i>
          <p class="font-medium text-lg">No orders found.</p>
        </div>
      `;
      return;
    }

    ordersContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        ${filteredOrders
          .map(
            (order) => `
          <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden flex flex-col">
            <div class="p-4 border-b border-border-base flex justify-between items-center bg-gray-50/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-sm">
                  ${getInitials(order.id)}
                </div>
                <div>
                  <h3 class="font-bold text-text-title leading-tight">${order.id}</h3>
                  <p class="text-xs text-text-body"><i class="far fa-clock mr-1"></i> ${order.time}</p>
                </div>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}">${order.status}</span>
            </div>
            
            <div class="p-4 flex-1">
              <p class="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Order Items</p>
              <ul class="space-y-3">
                ${order.items
                  .map(
                    (item) => `
                  <div class="flex justify-between items-start text-sm">
                    <div class="flex gap-2">
                      <span class="font-bold text-text-body">${item.qty}x</span>
                      <span class="font-medium text-text-title">${item.name}</span>
                    </div>
                  </div>
                `,
                  )
                  .join('')}
              </ul>
            </div>
            
            <div class="p-4 border-t border-border-base border-dashed flex justify-between items-center bg-surface">
              <span class="text-sm font-semibold text-text-body">Total</span>
              <span class="text-lg font-bold text-brand-500">${formatCurrency(order.total)}</span>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    `;
  };

  const fetchOrders = async () => {
    const ordersContainer = container.querySelector('#orders-container');
    const refreshBtn = container.querySelector('#refresh-btn');
    const refreshIcon = refreshBtn.querySelector('i');

    refreshBtn.disabled = true;
    refreshIcon.className = 'fas fa-spinner fa-spin mr-2';
    ordersContainer.innerHTML = `
      <div class="flex items-center justify-center h-full text-text-body">
        <i class="fas fa-spinner fa-spin text-3xl"></i>
      </div>
    `;

    try {
      orders = await orderApi.getDineInOrders();

      renderOrders();
    } catch (err) {
      ordersContainer.innerHTML = `<p class="text-status-danger-text text-center mt-10">Gagal memuat data.</p>`;
    } finally {
      refreshBtn.disabled = false;
      refreshIcon.className = 'fas fa-sync-alt mr-2';
    }
  };

  const attachFilterEvents = () => {
    container.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        currentFilter = e.target.dataset.filter;

        // Update tabs style
        container.querySelectorAll('.filter-btn').forEach((b) => {
          b.className = `filter-btn px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition border shadow-sm ${currentFilter === b.dataset.filter ? 'bg-brand-500 text-white border-brand-500' : 'bg-surface text-text-body border-border-base hover:bg-gray-50'}`;
        });

        renderOrders();
      });
    });
  };

  init();

  return container;
}

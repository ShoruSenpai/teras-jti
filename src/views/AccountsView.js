import Sidebar from '../components/Sidebar';
import AccountPopup from '../components/AccountPopup';
import { adminAuthStore } from '../stores/adminAuth.js';
import { accountApi } from '../api/accountApi.js';

export default function AccountsView() {
  const container = document.createElement('div');
  container.className = 'w-full h-screen flex bg-main overflow-hidden';

  let accounts = [];

  const init = async () => {
    container.innerHTML = `
      <div id="sidebar-container"></div>
      
      <main class="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header class="bg-main pt-8 px-8 pb-4 flex flex-col z-10 border-b border-border-base">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h1 class="text-3xl font-bold text-text-title mb-1">Accounts Management</h1>
              <p class="text-text-body">Manage staff access levels and system permissions.</p>
            </div>
            <button id="add-account-btn" class="px-5 py-2.5 bg-brand-500 text-white rounded-lg font-medium shadow-button flex items-center hover:bg-brand-600 transition">
              <i class="fas fa-user-plus mr-2"></i> Add Account
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-y-auto px-8 pb-8 pt-6">
          <div class="bg-surface rounded-2xl shadow-card border border-border-base overflow-hidden">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-border-base bg-gray-50/50">
                  <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider">Staff Name</th>
                  <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider">Email</th>
                  <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider">Role</th>
                  <th class="py-4 px-6 text-xs font-bold text-text-body uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody id="accounts-table-body" class="divide-y divide-border-base">
                <tr>
                  <td colspan="4" class="text-center py-10 text-text-muted">
                    <i class="fas fa-spinner fa-spin text-3xl"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    `;

    container.querySelector('#sidebar-container').appendChild(Sidebar());

    container
      .querySelector('#add-account-btn')
      .addEventListener('click', () => {
        const popup = AccountPopup(null, async () => {
          accounts = await accountApi.getAccounts();
          renderTable();
        });
        document.body.appendChild(popup);
      });

    // Fetch Data
    accounts = await accountApi.getAccounts();
    renderTable();
  };

  const renderTable = () => {
    const tbody = container.querySelector('#accounts-table-body');

    if (accounts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-text-muted font-medium">No accounts found.</td></tr>`;
      return;
    }

    tbody.innerHTML = accounts
      .map((acc) => {
        let roleColor = 'bg-gray-100 text-text-body';
        if (acc.role === 'owner')
          roleColor =
            'bg-status-success-bg text-status-success-text border border-status-success-text/20';
        if (acc.role === 'admin')
          roleColor =
            'bg-status-info-bg text-status-info-text border border-status-info-text/20';
        if (acc.role === 'kasir')
          roleColor =
            'bg-status-warning-bg text-status-warning-text border border-status-warning-text/20';

        const isMe = adminAuthStore.user?.id === acc.id;

        return `
        <tr class="hover:bg-gray-50/50 transition group">
          <td class="py-4 px-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 flex items-center justify-center font-bold text-sm shadow-sm overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name)}&background=d14d33&color=fff" class="w-full h-full object-cover">
              </div>
              <p class="font-bold text-text-title">${acc.name} ${isMe ? '<span class="text-xs text-text-muted font-normal ml-1">(You)</span>' : ''}</p>
            </div>
          </td>
          <td class="py-4 px-6 font-medium text-text-body">
            ${acc.email}
          </td>
          <td class="py-4 px-6">
            <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleColor}">
              ${acc.role}
            </span>
          </td>
          <td class="py-4 px-6 text-right">
            <div class="flex justify-end space-x-2">
              <button class="edit-btn w-8 h-8 rounded-lg bg-gray-100 text-text-body hover:text-brand-500 hover:bg-brand-50 transition flex items-center justify-center" data-id="${acc.id}" title="Edit Account">
                <i class="fas fa-pencil-alt text-sm"></i>
              </button>
              ${
                !isMe
                  ? `
              <button class="del-btn w-8 h-8 rounded-lg bg-gray-100 text-text-body hover:text-status-danger-text hover:bg-status-danger-bg transition flex items-center justify-center" data-id="${acc.id}" title="Delete Account">
                <i class="far fa-trash-alt text-sm"></i>
              </button>
              `
                  : `<div class="w-8"></div>`
              }
            </div>
          </td>
        </tr>
      `;
      })
      .join('');

    // Attach Events
    tbody.querySelectorAll('.edit-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id);
        const account = accounts.find((a) => a.id === id);
        if (account) {
          const popup = AccountPopup(account, async () => {
            accounts = await accountApi.getAccounts();
            renderTable();
          });
          document.body.appendChild(popup);
        }
      });
    });

    tbody.querySelectorAll('.del-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this account?')) {
          const id = parseInt(btn.dataset.id);
          const icon = btn.querySelector('i');
          icon.className = 'fas fa-spinner fa-spin text-xs';
          btn.disabled = true;

          try {
            await accountApi.deleteAccount(id);
            accounts = accounts.filter((a) => a.id !== id);
            renderTable();
          } catch (e) {
            console.error(e);
            icon.className = 'far fa-trash-alt text-xs';
            btn.disabled = false;
          }
        }
      });
    });
  };

  init();

  return container;
}

import { ApiService } from '../services/api';
import Swal from 'sweetalert2';
import { adminAuthStore } from '../stores/adminAuth.js';

export default function AccountPopup(item, onSuccess, onClose) {
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-text-title/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]';

  const isEdit = !!item;

  const isOwner = adminAuthStore.user?.role === 'owner';

  const formData = isEdit
    ? { ...item, password: '' }
    : { name: '', email: '', password: '', role: 'cashier' };

  overlay.innerHTML = `
    <div class="bg-surface rounded-2xl shadow-modal w-full max-w-md overflow-hidden animate-[slideUp_0.4s_ease-out] flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-border-base bg-surface flex justify-between items-center">
        <h2 class="text-xl font-bold text-text-title">${isEdit ? 'Edit Account' : 'Add New Account'}</h2>
        <button id="close-modal-btn" class="text-text-body hover:text-brand-500 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto bg-surface">
        <form id="account-form" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Staff Name <span class="text-status-danger-text">*</span></label>
            <input type="text" id="a-name" value="${formData.name}" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition" required>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Email Address <span class="text-status-danger-text">*</span></label>
            <input type="email" id="a-email" value="${formData.email}" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition" required>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Role <span class="text-status-danger-text">*</span></label>
            <select id="a-role" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition ${!isOwner ? 'bg-gray-100 cursor-not-allowed' : ''}" ${!isOwner ? 'disabled' : ''}>
              <option value="cashier" ${formData.role === 'cashier' ? 'selected' : ''}>cashier</option>
              <option value="admin" ${formData.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="owner" ${formData.role === 'owner' ? 'selected' : ''}>Owner</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">
              ${isEdit ? 'New Password <span class="text-xs font-normal text-text-muted">(Biarkan kosong jika tidak ingin mengubah)</span>' : 'Password <span class="text-status-danger-text">*</span>'}
            </label>
            <div class="relative">
              <input type="password" id="a-password" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition pr-10" ${!isEdit ? 'required' : ''}>
              <button type="button" id="toggle-pwd-btn" class="absolute right-3 top-2.5 text-text-muted hover:text-brand-500 transition">
                <i class="far fa-eye"></i>
              </button>
            </div>
          </div>

          <div class="pt-4 border-t border-border-base flex justify-end gap-3 mt-6">
            <button type="button" id="cancel-btn" class="px-5 py-2.5 rounded-lg border border-border-base text-text-title font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" id="save-btn" class="px-5 py-2.5 rounded-lg bg-brand-500 text-white font-bold hover:bg-brand-600 shadow-button transition flex items-center">
              ${isEdit ? 'Update Account' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => {
    const close = () => {
      overlay.classList.replace(
        'animate-[fadeIn_0.3s_ease-in-out]',
        'opacity-0',
      );
      overlay.classList.add('transition-opacity', 'duration-300');
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onClose) onClose();
      }, 300);
    };

    overlay.querySelector('#close-modal-btn').addEventListener('click', close);
    overlay.querySelector('#cancel-btn').addEventListener('click', close);

    // Fitur Toggle Show/Hide Password Input
    const pwdInput = overlay.querySelector('#a-password');
    overlay.querySelector('#toggle-pwd-btn').addEventListener('click', (e) => {
      const type =
        pwdInput.getAttribute('type') === 'password' ? 'text' : 'password';
      pwdInput.setAttribute('type', type);
      e.currentTarget.innerHTML =
        type === 'password'
          ? '<i class="far fa-eye"></i>'
          : '<i class="far fa-eye-slash"></i>';
    });

    overlay
      .querySelector('#account-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameVal = overlay.querySelector('#a-name').value;
        const emailVal = overlay.querySelector('#a-email').value;
        const roleVal = overlay.querySelector('#a-role').value;
        const passwordVal = pwdInput.value;

        const payload = {
          name: nameVal,
          email: emailVal,
          role: roleVal,
        };

        if (passwordVal) payload.password = passwordVal;

        if (
          isOwner &&
          isEdit &&
          (passwordVal !== '' || roleVal !== item.role) &&
          item.id !== adminAuthStore.user.id
        ) {
          const { value: ownerPassword } = await Swal.fire({
            title: 'Otorisasi Keamanan',
            text: `Masukkan password Owner Anda untuk mengubah data ${nameVal}.`,
            input: 'password',
            inputPlaceholder: 'Password Owner Anda',
            showCancelButton: true,
            confirmButtonText: 'Verifikasi & Simpan',
            confirmButtonColor: '#2563EB',
            customClass: { container: 'z-[99999]' },
            inputValidator: (value) => {
              if (!value) return 'Password tidak boleh kosong!';
            },
          });

          if (!ownerPassword) return;
        }

        const saveBtn = overlay.querySelector('#save-btn');
        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Saving...';
        saveBtn.disabled = true;

        try {
          if (isEdit) {
            await ApiService.updateAccount(item.id, payload);
          } else {
            await ApiService.addAccount(payload);
          }

          close();
          if (onSuccess) onSuccess();

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: isEdit
              ? 'Account updated successfully.'
              : 'New account created successfully.',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text:
              error.message || 'Terjadi kesalahan saat menyimpan data akun.',
            customClass: { container: 'z-[99999]' },
          });
          saveBtn.innerHTML = originalBtnText;
          saveBtn.disabled = false;
        }
      });
  }, 0);

  return overlay;
}

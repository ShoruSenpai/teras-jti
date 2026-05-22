import { menuApi } from '../api/menuApi.js';
import Swal from 'sweetalert2';

export default function MenuPopup(item, categories, onSuccess, onClose) {
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-text-title/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]';

  const isEdit = !!item;

  let initialStatus = 'Available';
  if (isEdit) {
    if (item.status === 'sold_out') initialStatus = 'Out of Stock';
    if (item.status === 'disabled') initialStatus = 'Disabled';
  }

  const formData = isEdit
    ? {
        ...item,
        status: initialStatus,
        stock: item.stock ?? 100,
        is_new: item.is_new ?? false,
        is_recommended: item.is_recommended ?? false,
      }
    : {
        name: '',
        category: categories.length > 0 ? categories[0] : '',
        price: '',
        stock: 100,
        description: '',
        image: '',
        is_new: true,
        is_recommended: false,
        status: 'Available',
      };

  overlay.innerHTML = `
    <div class="bg-surface rounded-2xl shadow-modal w-full max-w-lg overflow-hidden animate-[slideUp_0.4s_ease-out] flex flex-col max-h-[90vh]">
      
      <div class="p-6 border-b border-border-base bg-surface flex justify-between items-center z-10">
        <h2 class="text-xl font-bold text-text-title">${isEdit ? 'Edit Menu Item' : 'Add New Item'}</h2>
        <button id="close-modal-btn" class="text-text-body hover:text-brand-500 transition w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto bg-surface custom-scrollbar">
        <form id="menu-form" class="space-y-5">
          
          <div>
            <label class="block text-sm font-semibold text-text-title mb-1.5">Item Name <span class="text-status-danger-text">*</span></label>
            <input type="text" id="m-name" value="${formData.name}" placeholder="e.g. Nasi Goreng Spesial" class="w-full px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition" required>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1.5">Price (Rp) <span class="text-status-danger-text">*</span></label>
              <input type="number" id="m-price" value="${formData.price}" placeholder="25000" class="w-full px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition" required min="0">
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1.5">Stock <span class="text-status-danger-text">*</span></label>
              <input type="number" id="m-stock" value="${formData.stock}" class="w-full px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition" required min="0">
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1.5">Category <span class="text-status-danger-text">*</span></label>
              
              <div class="relative">
                <select id="m-cat" class="w-full appearance-none px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition cursor-pointer" required>
                  ${
                    categories.length > 0
                      ? categories
                          .map(
                            (c) =>
                              `<option value="${c}" ${formData.category === c ? 'selected' : ''}>${c}</option>`,
                          )
                          .join('')
                      : `<option value="" disabled selected>No Categories Found</option>`
                  }
                </select>
                <span class="absolute right-4 top-3.5 text-text-body pointer-events-none">
                  <i class="fas fa-chevron-down text-xs"></i>
                </span>
              </div>
              </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1.5">Description</label>
            <textarea id="m-desc" rows="3" placeholder="Deskripsi singkat tentang menu ini..." class="w-full px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition resize-none">${formData.description || ''}</textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1.5">Image URL <span class="text-text-body font-normal text-xs">(Optional)</span></label>
            <input type="url" id="m-img" value="${formData.image}" placeholder="https://..." class="w-full px-4 py-2.5 rounded-xl border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white transition">
          </div>

          <div class="grid grid-cols-2 gap-4 pt-2">
            <label class="flex items-center justify-between p-4 border border-border-base rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <div>
                <p class="text-sm font-bold text-text-title">New Item</p>
                <p class="text-[10px] text-text-body mt-0.5">Show 'New' badge</p>
              </div>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="m-is-new" class="sr-only peer" ${formData.is_new ? 'checked' : ''}>
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </div>
            </label>
            
            <label class="flex items-center justify-between p-4 border border-border-base rounded-xl cursor-pointer hover:bg-gray-50 transition">
              <div>
                <p class="text-sm font-bold text-text-title">Recommended</p>
                <p class="text-[10px] text-text-body mt-0.5">Highlight as favorite</p>
              </div>
              <div class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="m-is-recommended" class="sr-only peer" ${formData.is_recommended ? 'checked' : ''}>
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
              </div>
            </label>
          </div>

          <div class="pt-2">
            <label class="block text-sm font-semibold text-text-title mb-2">Availability Status</label>
            <div class="flex space-x-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              ${['Available', 'Out of Stock', 'Disabled']
                .map(
                  (s) => `
                <label class="flex items-center text-sm font-medium text-text-title cursor-pointer group">
                  <div class="relative flex items-center justify-center mr-2">
                    <input type="radio" name="m-status" value="${s}" ${formData.status === s ? 'checked' : ''} class="peer sr-only">
                    <div class="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-brand-500 peer-checked:bg-brand-500 transition flex items-center justify-center">
                      <div class="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition"></div>
                    </div>
                  </div>
                  <span class="group-hover:text-brand-500 transition">${s}</span>
                </label>
              `,
                )
                .join('')}
            </div>
          </div>

          <div class="pt-6 border-t border-border-base flex justify-end gap-3 mt-4">
            <button type="button" id="cancel-btn" class="px-6 py-2.5 rounded-xl border border-border-base text-text-title font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" id="save-btn" class="px-6 py-2.5 rounded-xl bg-brand-500 text-white font-bold hover:bg-brand-600 shadow-button transition flex items-center">
              ${isEdit ? 'Update Menu' : 'Save Menu'}
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

    overlay
      .querySelector('#menu-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();

        const saveBtn = overlay.querySelector('#save-btn');
        const originalBtnText = saveBtn.innerHTML;
        saveBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        saveBtn.disabled = true;

        const payload = {
          name: overlay.querySelector('#m-name').value,
          price: parseInt(overlay.querySelector('#m-price').value) || 0,
          stock: parseInt(overlay.querySelector('#m-stock').value) || 0,
          category: overlay.querySelector('#m-cat').value,
          description: overlay.querySelector('#m-desc').value,
          image: overlay.querySelector('#m-img').value,
          is_new: overlay.querySelector('#m-is-new').checked,
          is_recommended: overlay.querySelector('#m-is-recommended').checked,
          status: overlay.querySelector('input[name="m-status"]:checked').value,
        };

        try {
          if (isEdit) {
            await menuApi.updateMenuItem(item.id, payload);
          } else {
            await menuApi.addMenuItem(payload);
          }

          close();
          if (onSuccess) onSuccess();

          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: isEdit
              ? 'Menu updated successfully.'
              : 'New menu added successfully.',
            timer: 2000,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
          });
        } catch (error) {
          console.error(error);

          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text:
              error.message ||
              'Gagal menyimpan menu. Periksa kembali inputan kamu.',
            confirmButtonColor: '#E74C3C',
            customClass: {
              container: 'z-[99999]',
            },
          });

          saveBtn.innerHTML = originalBtnText;
          saveBtn.disabled = false;
        }
      });
  }, 0);

  return overlay;
}

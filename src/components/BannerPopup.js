import { ApiService } from '../services/api';

export default function BannerPopup(banner, onSuccess, onClose) {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-text-title/50 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.3s_ease-in-out]';

  const isEdit = !!banner;
  const formData = isEdit ? { ...banner } : {
    banner_title: '',
    image_url: '',
    link_url: '',
    start_at: '',
    end_at: '',
    is_active: true,
    display_order: 1
  };

  // Format datetime-local value
  const formatDT = (val) => val ? val.substring(0, 16) : '';

  overlay.innerHTML = `
    <div class="bg-surface rounded-2xl shadow-modal w-full max-w-lg overflow-hidden animate-[slideUp_0.4s_ease-out] flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-border-base bg-surface flex justify-between items-center">
        <h2 class="text-xl font-bold text-text-title">${isEdit ? 'Edit Banner' : 'Create New Banner'}</h2>
        <button id="close-modal-btn" class="text-text-body hover:text-brand-500 transition">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <div class="p-6 flex-1 overflow-y-auto bg-surface">
        <form id="banner-form" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Banner Title</label>
            <input type="text" id="b-title" value="${formData.banner_title}" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Image URL</label>
            <input type="url" id="b-image" value="${formData.image_url}" placeholder="https://..." class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
          </div>

          <!-- Preview -->
          <div id="b-preview-container" class="${formData.image_url ? '' : 'hidden'}">
            <img id="b-preview-img" src="${formData.image_url}" alt="Preview" class="w-full h-32 object-cover rounded-lg border border-border-base">
          </div>

          <div>
            <label class="block text-sm font-semibold text-text-title mb-1">Link URL (optional)</label>
            <input type="text" id="b-link" value="${formData.link_url}" placeholder="/promo/some-page" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1">Start Date</label>
              <input type="datetime-local" id="b-start" value="${formatDT(formData.start_at)}" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
            </div>
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1">End Date</label>
              <input type="datetime-local" id="b-end" value="${formatDT(formData.end_at)}" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-text-title mb-1">Display Order</label>
              <input type="number" id="b-order" value="${formData.display_order}" min="1" class="w-full px-3 py-2 rounded-lg border border-border-base focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white" required>
            </div>
            <div class="flex items-end pb-1">
              <label class="flex items-center cursor-pointer gap-3">
                <div class="relative">
                  <input type="checkbox" id="b-active" ${formData.is_active ? 'checked' : ''} class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-500 transition-colors"></div>
                  <div class="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span class="text-sm font-semibold text-text-title">Active</span>
              </label>
            </div>
          </div>

          <div class="pt-4 border-t border-border-base flex justify-end gap-3 mt-6">
            <button type="button" id="cancel-btn" class="px-5 py-2 rounded-lg border border-border-base text-text-title font-medium hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" id="save-btn" class="px-5 py-2 rounded-lg bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-button transition flex items-center">
              ${isEdit ? 'Update Banner' : 'Save Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => {
    const close = () => {
      overlay.classList.replace('animate-[fadeIn_0.3s_ease-in-out]', 'opacity-0');
      overlay.classList.add('transition-opacity', 'duration-300');
      setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (onClose) onClose();
      }, 300);
    };

    // Live image preview
    const imgInput = overlay.querySelector('#b-image');
    const previewContainer = overlay.querySelector('#b-preview-container');
    const previewImg = overlay.querySelector('#b-preview-img');
    imgInput.addEventListener('input', () => {
      if (imgInput.value) {
        previewImg.src = imgInput.value;
        previewContainer.classList.remove('hidden');
      } else {
        previewContainer.classList.add('hidden');
      }
    });

    overlay.querySelector('#close-modal-btn').addEventListener('click', close);
    overlay.querySelector('#cancel-btn').addEventListener('click', close);

    overlay.querySelector('#banner-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const saveBtn = overlay.querySelector('#save-btn');
      saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      saveBtn.disabled = true;

      const payload = {
        banner_title: overlay.querySelector('#b-title').value,
        image_url: overlay.querySelector('#b-image').value,
        link_url: overlay.querySelector('#b-link').value,
        start_at: overlay.querySelector('#b-start').value,
        end_at: overlay.querySelector('#b-end').value,
        display_order: parseInt(overlay.querySelector('#b-order').value),
        is_active: overlay.querySelector('#b-active').checked
      };

      try {
        if (isEdit) {
          await ApiService.updateBanner(banner.banner_id, payload);
        } else {
          await ApiService.addBanner(payload);
        }
        close();
        if (onSuccess) onSuccess();
      } catch (error) {
        console.error(error);
        saveBtn.innerHTML = isEdit ? 'Update Banner' : 'Save Banner';
        saveBtn.disabled = false;
      }
    });
  }, 0);

  return overlay;
}

const MAX_AVATAR_DIMENSION = 256;
const AVATAR_OUTPUT_QUALITY = 0.82;
const MAX_UPLOAD_SIZE_BYTES = 4 * 1024 * 1024;

export const avatarUploadLimits = {
  maxUploadSizeBytes: MAX_UPLOAD_SIZE_BYTES,
};

export const fileToOptimizedAvatarDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file selected.'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image file.'));
      return;
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      reject(new Error('Image is too large. Max size is 4 MB.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to process image.'));
      img.onload = () => {
        const scale = Math.min(
          1,
          MAX_AVATAR_DIMENSION / img.width,
          MAX_AVATAR_DIMENSION / img.height
        );
        const targetWidth = Math.max(1, Math.round(img.width * scale));
        const targetHeight = Math.max(1, Math.round(img.height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to process image.'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', AVATAR_OUTPUT_QUALITY));
      };
      img.src = reader.result;
    };

    reader.readAsDataURL(file);
  });

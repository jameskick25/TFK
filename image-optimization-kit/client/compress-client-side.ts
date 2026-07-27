/**
 * ══════════════════════════════════════════════════════════════
 *  CLIENT-SIDE IMAGE PRE-COMPRESSION (Optional)
 * ══════════════════════════════════════════════════════════════
 * 
 *  Uses HTML Canvas to pre-compress images on the client side
 *  BEFORE sending them to the server. This reduces the network
 *  payload but is NOT a replacement for server-side sharp compression.
 * 
 *  Why both client + server?
 *    - Client-side: Reduces upload size (e.g., 5 MB → 500 KB over network)
 *    - Server-side sharp: Guarantees consistent, high-quality WebP output
 *      regardless of browser/device. Canvas quality varies across browsers.
 * 
 *  Usage in your form component:
 *    const compressed = await compressImage(file);
 *    formData.append('image_color', compressed);
 * ══════════════════════════════════════════════════════════════
 */

/**
 * Compresses an image file using HTML Canvas.
 * 
 * @param file      - The original File from an <input type="file">
 * @param maxWidth  - Maximum width in pixels (default: 800)
 * @param quality   - WebP quality 0.0 to 1.0 (default: 0.75)
 * @returns         - A new File object with .webp extension and compressed data
 */
export const compressImage = async (
  file: File,
  maxWidth = 800,
  quality = 0.75
): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Only resize if larger than maxWidth
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(file); // Fallback to original if no canvas context
        
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            // Create new file with .webp extension
            const lastDot = file.name.lastIndexOf('.');
            const baseName = lastDot !== -1 ? file.name.substring(0, lastDot) : file.name;
            resolve(new File([blob], `${baseName}.webp`, { type: 'image/webp', lastModified: Date.now() }));
          } else {
            resolve(file); // Fallback to original if blob creation fails
          }
        }, 'image/webp', quality);
      };
      img.onerror = () => resolve(file); // Fallback on image load error
    };
    reader.onerror = () => resolve(file); // Fallback on file read error
  });
};

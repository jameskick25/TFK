/**
 * ══════════════════════════════════════════════════════════════
 *  OPTIMIZATION DASHBOARD — Server Actions
 * ══════════════════════════════════════════════════════════════
 * 
 *  Server-side actions for the admin image optimization dashboard.
 *  These functions handle:
 *    - Fetching all images from the database
 *    - Checking image file sizes
 *    - Optimizing existing images (download → compress → re-upload → update DB)
 *    - Dry-run testing (verifies the pipeline without modifying data)
 * 
 *  This file should be placed at: src/app/actions/optimize.ts
 * 
 *  Dependencies:
 *    - sharp (npm install sharp)
 *    - A Supabase admin client utility (see utils/supabase-server.ts)
 * 
 *  Environment variables required:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 * 
 *  Database table required:
 *    - product_images (id, product_id, url, color, is_main, display_order)
 *    - products (id, name, slug) — joined for display
 * 
 *  Storage bucket required:
 *    - "products" bucket (public) in Supabase Storage
 * ══════════════════════════════════════════════════════════════
 */

'use server';

import { createAdminClient } from '@/utils/supabase/server';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import https from 'https';
import http from 'http';

// ── UTILITY: Download file via native HTTP/HTTPS ─────────────
/**
 * Downloads a file from a URL using Node's native HTTP/HTTPS modules.
 * Handles redirects automatically. Avoids Next.js global fetch patching
 * that corrupts binary data.
 */
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const handleResponse = (res: any) => {
      // Follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: status ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    };
    const targetUrl = encodeURI(decodeURI(url.split('?')[0]));
    const protocol = targetUrl.startsWith('https') ? https : http;
    protocol.get(targetUrl, handleResponse).on('error', reject);
  });
}

// ── UTILITY: Upload to Supabase via native HTTPS ─────────────
/**
 * Uploads a file to Supabase Storage using native HTTPS request.
 * This completely bypasses the Supabase JS client and Next.js patched fetch,
 * preventing binary corruption during upload.
 */
function uploadToSupabase(
  bucket: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string,
  supabaseUrl: string,
  serviceRoleKey: string
): Promise<{ error: string | null }> {
  return new Promise((resolve) => {
    const url = new URL(`/storage/v1/object/${bucket}/${encodeURIComponent(filePath)}`, supabaseUrl);

    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk: string) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ error: null });
        } else {
          resolve({ error: `Upload HTTP ${res.statusCode}: ${body}` });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ error: `Upload network error: ${err.message}` });
    });

    req.write(fileBuffer);
    req.end();
  });
}

// ══════════════════════════════════════════════════════════════
//  EXPORTED FUNCTIONS (used by the optimize-images dashboard)
// ══════════════════════════════════════════════════════════════

/**
 * Fetches ALL images from the product_images table, joined with product name.
 * Used by the optimization dashboard to display the full image list.
 * 
 * ADAPT: Change 'product_images' and 'products(name, slug)' if your
 * table names or columns are different.
 */
export async function getImagesToOptimize() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('product_images')
    .select('*, products(name, slug)')
    .order('display_order', { ascending: true });
  
  if (error) {
    return [];
  }
  return data || [];
}

/**
 * Gets the actual file size of an image stored in Supabase by downloading it.
 * Returns size in bytes. Returns 0 on error.
 */
export async function getImageSize(url: string): Promise<number> {
  try {
    const cleanUrl = url.split('?')[0];
    const originalBuffer = await downloadFile(cleanUrl);
    return originalBuffer.length;
  } catch {
    return 0;
  }
}

/**
 * Optimizes a SINGLE existing image. Full server-side pipeline:
 * 
 *   1. Downloads the current image from Supabase Storage (native HTTPS)
 *   2. Compresses it with sharp → WebP 800px max, quality 75
 *   3. Uploads the compressed version (native HTTPS, NOT supabase client)
 *   4. Updates the database URL to point to the new file
 *   5. Deletes the old file from storage
 *   6. Invalidates Next.js cache
 * 
 * @param imageId  - The UUID of the row in product_images
 * @param imageUrl - The current public URL of the image
 * 
 * ADAPT: Change 'product_images', bucket name 'products', and
 * bucket marker '/products/' if your setup differs.
 */
export async function optimizeSingleImage(imageId: string, imageUrl: string) {
  try {
    const supabase = await createAdminClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Download the original image using native HTTPS
    const originalBuffer = await downloadFile(imageUrl);
    const originalSizeKb = Math.round(originalBuffer.length / 1024);

    // 2. Compress with sharp
    const compressedBuffer = await sharp(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    
    const newSizeKb = Math.round(compressedBuffer.length / 1024);

    // 3. Generate clean filename
    const urlPath = imageUrl.split('?')[0];
    const bucketMarker = '/products/';  // ADAPT: change if your bucket name differs
    const bucketIndex = urlPath.lastIndexOf(bucketMarker);
    const oldStoragePath = bucketIndex !== -1
      ? decodeURIComponent(urlPath.substring(bucketIndex + bucketMarker.length))
      : decodeURIComponent(urlPath.split('/').pop() || 'image.jpg');
    
    const baseName = oldStoragePath
      .replace(/\.[^/.]+$/, '')
      .split('-opt-')[0]            // Remove previous optimization suffix if re-optimizing
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const newFileName = `${baseName}-opt-${Date.now()}.webp`;

    // 4. Upload using native HTTPS
    const { error: uploadError } = await uploadToSupabase(
      'products',   // ADAPT: change if your bucket name differs
      newFileName,
      compressedBuffer,
      'image/webp',
      supabaseUrl,
      serviceRoleKey
    );

    if (uploadError) {
      return { success: false, error: uploadError };
    }

    // 5. Construct public URL directly
    const newUrl = `${supabaseUrl}/storage/v1/object/public/products/${encodeURIComponent(newFileName)}`;

    // 6. Update DB
    const { error: dbError } = await supabase
      .from('product_images')   // ADAPT: change if your table name differs
      .update({ url: newUrl })
      .eq('id', imageId);

    if (dbError) {
      return { success: false, error: 'DB update failed: ' + dbError.message };
    }

    // 7. Delete old file from storage
    if (oldStoragePath !== newFileName) {
      await supabase.storage.from('products').remove([oldStoragePath]);
    }

    // 8. Invalidate Next.js cache
    revalidatePath('/', 'layout');

    const percentSaved = Math.round(((originalSizeKb - newSizeKb) / originalSizeKb) * 100);

    return {
      success: true,
      newUrl,
      originalSizeKb,
      newSizeKb,
      savedText: `-${percentSaved}% (${originalSizeKb} Ko → ${newSizeKb} Ko)`
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Unknown error' };
  }
}

/**
 * DRY RUN: Tests the full pipeline WITHOUT modifying the DB or deleting files.
 * Uploads a temporary test file, verifies it, then cleans it up.
 * Useful for debugging upload issues.
 */
export async function dryRunOptimize(imageUrl: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 1. Download
    const originalBuffer = await downloadFile(imageUrl);
    const originalSizeKb = Math.round(originalBuffer.length / 1024);

    // 2. Compress
    const compressedBuffer = await sharp(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    const newSizeKb = Math.round(compressedBuffer.length / 1024);

    // Verify sharp output is valid WebP (starts with RIFF....WEBP)
    const header = compressedBuffer.slice(0, 12);
    const riffOk = header[0] === 0x52 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x46;
    const webpOk = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;

    // 3. Upload test file
    const testFileName = `_test_${Date.now()}.webp`;
    const { error: uploadError } = await uploadToSupabase(
      'products',
      testFileName,
      compressedBuffer,
      'image/webp',
      supabaseUrl,
      serviceRoleKey
    );

    if (uploadError) {
      return { success: false, error: `Upload FAILED: ${uploadError}`, debug: `testFile: ${testFileName}` };
    }

    // 4. Verify by re-downloading
    const testUrl = `${supabaseUrl}/storage/v1/object/public/products/${encodeURIComponent(testFileName)}`;
    let uploadedHeader = '';
    let uploadedSize = 0;
    try {
      const uploadedBuf = await downloadFile(testUrl);
      uploadedSize = uploadedBuf.length;
      const h = uploadedBuf.slice(0, 12);
      uploadedHeader = Array.from(h).map(b => b.toString(16).padStart(2, '0')).join(' ');
    } catch (e: any) {
      uploadedHeader = `Download check failed: ${e.message}`;
    }

    // 5. Clean up test file
    const supabase = await createAdminClient();
    await supabase.storage.from('products').remove([testFileName]);

    return {
      success: true,
      debug: [
        `Original URL: ${imageUrl.split('?')[0]}`,
        `Sharp output valid WebP: RIFF=${riffOk} WEBP=${webpOk}`,
        `Sharp output first 12 bytes: ${Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ')}`,
        `Compressed size: ${compressedBuffer.length} bytes`,
        `Test file uploaded as: "${testFileName}"`,
        `Test URL: ${testUrl}`,
        `Re-downloaded size: ${uploadedSize} bytes`,
        `Re-downloaded first 12 bytes: ${uploadedHeader}`,
        `Sizes match: ${uploadedSize === compressedBuffer.length}`,
        `Original: ${originalSizeKb} Ko → Compressed: ${newSizeKb} Ko`,
      ].join('\n')
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error', debug: '' };
  }
}

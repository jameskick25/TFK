'use server';

import { createAdminClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import https from 'https';
import http from 'http';

// ── UTILITY: Download file via native HTTP/HTTPS ─────────────
function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const handleResponse = (res: any) => {
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

export async function getImagesToOptimize() {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('product_images')
    .select('*, products(name, slug)');
  
  if (error) {
    console.error('Error fetching images to optimize:', error);
    return [];
  }
  return data || [];
}

export async function getImageSize(url: string): Promise<number> {
  try {
    const cleanUrl = url.split('?')[0];
    const originalBuffer = await downloadFile(cleanUrl);
    return originalBuffer.length;
  } catch {
    return 0;
  }
}

export async function optimizeSingleImage(imageId: string, imageUrl: string) {
  try {
    const supabase = await createAdminClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Supabase credentials missing' };
    }

    // 1. Download the original image using native HTTPS
    const originalBuffer = await downloadFile(imageUrl);
    const originalSizeKb = Math.round(originalBuffer.length / 1024);

    // 2. Compress with sharp
    let sharpModule: any;
    try {
      sharpModule = (await import('sharp')).default;
    } catch (e: any) {
      return { success: false, error: 'Sharp non disponible dans cet environnement' };
    }

    const compressedBuffer = await sharpModule(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();
    
    const newSizeKb = Math.round(compressedBuffer.length / 1024);

    // 3. Generate clean filename
    const urlPath = imageUrl.split('?')[0];
    const bucketMarker = '/products/';
    const bucketIndex = urlPath.lastIndexOf(bucketMarker);
    const oldStoragePath = bucketIndex !== -1
      ? decodeURIComponent(urlPath.substring(bucketIndex + bucketMarker.length))
      : decodeURIComponent(urlPath.split('/').pop() || 'image.jpg');
    
    const baseName = oldStoragePath
      .replace(/\.[^/.]+$/, '')
      .split('-opt-')[0]
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const newFileName = `${baseName}-opt-${Date.now()}.webp`;

    // 4. Upload using native HTTPS
    const { error: uploadError } = await uploadToSupabase(
      'products',
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
      .from('product_images')
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

    const percentSaved = Math.round(((originalSizeKb - newSizeKb) / Math.max(originalSizeKb, 1)) * 100);

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

export async function dryRunOptimize(imageUrl: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return { success: false, error: 'Supabase credentials missing', debug: '' };
    }

    // 1. Download
    const originalBuffer = await downloadFile(imageUrl);
    const originalSizeKb = Math.round(originalBuffer.length / 1024);

    // 2. Compress
    let sharpModule: any;
    try {
      sharpModule = (await import('sharp')).default;
    } catch (e: any) {
      return { success: false, error: 'Sharp non disponible dans cet environnement' };
    }

    const compressedBuffer = await sharpModule(originalBuffer)
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
        `Sharp output first 12 bytes: ${Array.from(header).map((b: any) => Number(b).toString(16).padStart(2, '0')).join(' ')}`,
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

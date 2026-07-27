import sharp from 'sharp';
import https from 'https';

/**
 * Uploads a binary buffer to Supabase Storage using native HTTPS request.
 * 
 * WHY NATIVE HTTPS?
 * Next.js patches the global fetch() function, which can corrupt binary data
 * during upload. The Supabase JS client uses fetch internally, so uploading
 * images through it can result in corrupted files that look valid but won't
 * render. Using Node.js native https.request() completely bypasses this issue.
 */
function uploadToSupabaseNative(
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
        'x-upsert': 'true', // Overwrites if file already exists
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

    // Write raw binary buffer directly — never convert to string
    req.write(fileBuffer);
    req.end();
  });
}

/**
 * Compresses an uploaded image file with sharp and uploads to Supabase.
 * 
 * Pipeline:
 *   1. Read File → ArrayBuffer → Buffer
 *   2. sharp: resize to max 800px width (no upscale) + convert to WebP at quality 75
 *   3. Upload to Supabase via native HTTPS
 *   4. Return the public URL of the optimized image
 */
export async function compressAndUploadImage(
  file: File,
  storageName: string,
  bucket: string = 'products'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !serviceRoleKey) {
      return { url: null, error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing' };
    }

    // 1. Read the uploaded file into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    // 2. Compress with sharp → WebP, 800px max width, quality 75
    const compressedBuffer = await sharp(originalBuffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 75 })
      .toBuffer();

    // 3. Generate a clean, URL-safe filename with .webp extension
    const baseName = storageName
      .replace(/\.[^/.]+$/, '')            // Remove any file extension
      .replace(/[^a-zA-Z0-9_-]/g, '-')    // Replace special chars with hyphens
      .replace(/-+/g, '-')                 // Collapse multiple hyphens
      .replace(/^-|-$/g, '');              // Trim leading/trailing hyphens
    const fileName = `${baseName}-opt-${Date.now()}.webp`;

    // 4. Upload using native HTTPS (bypasses supabase client + Next.js fetch)
    const { error: uploadError } = await uploadToSupabaseNative(
      bucket,
      fileName,
      compressedBuffer,
      'image/webp',
      supabaseUrl,
      serviceRoleKey
    );

    if (uploadError) {
      console.error('Image optimization upload error:', uploadError);
      return { url: null, error: uploadError };
    }

    // 5. Construct and return the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${encodeURIComponent(fileName)}`;
    return { url: publicUrl, error: null };

  } catch (err: any) {
    console.error('Sharp compression error:', err);
    return { url: null, error: err.message || 'Compression error' };
  }
}

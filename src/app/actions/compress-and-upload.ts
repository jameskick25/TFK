import https from 'https';

const FALLBACK_SUPABASE_URL = 'https://wkxnaqdtubgdvtnijpiy.supabase.co';
const FALLBACK_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndreG5hcWR0dWJnZHZ0bmlqcGl5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYxMDExNiwiZXhwIjoyMDk3MTg2MTE2fQ.6D0hYbXNsRHW6RGFAPCUUPwW0WEzxA-H4gvetQ3kyYI';

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
 * Compresses an uploaded image file with sharp (if available) and uploads to Supabase.
 * Falls back gracefully to original buffer if sharp cannot be loaded in serverless environment.
 */
export async function compressAndUploadImage(
  file: File,
  storageName: string,
  bucket: string = 'products'
): Promise<{ url: string | null; error: string | null }> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || FALLBACK_SERVICE_ROLE_KEY;

    // 1. Read the uploaded file into a Node.js Buffer
    const arrayBuffer = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuffer);

    let finalBuffer: Buffer = originalBuffer;
    let contentType: string = file.type || 'image/jpeg';
    let extension: string = 'jpeg';

    // 2. Try compressing with sharp dynamically
    try {
      const sharpModule = (await import('sharp')).default;
      finalBuffer = await sharpModule(originalBuffer)
        .resize({ width: 800, withoutEnlargement: true })
        .webp({ quality: 75 })
        .toBuffer();
      contentType = 'image/webp';
      extension = 'webp';
    } catch (sharpErr) {
      console.warn('Sharp non disponible ou erreur, téléversement de l\'image d\'origine:', sharpErr);
      if (file.type?.includes('png')) extension = 'png';
      else if (file.type?.includes('webp')) extension = 'webp';
      else extension = 'jpeg';
    }

    // 3. Generate a clean, URL-safe filename
    const baseName = storageName
      .replace(/\.[^/.]+$/, '')            // Remove any file extension
      .replace(/[^a-zA-Z0-9_-]/g, '-')    // Replace special chars with hyphens
      .replace(/-+/g, '-')                 // Collapse multiple hyphens
      .replace(/^-|-$/g, '');              // Trim leading/trailing hyphens
    const fileName = `${baseName}-opt-${Date.now()}.${extension}`;

    // 4. Upload using native HTTPS (bypasses supabase client + Next.js fetch)
    const { error: uploadError } = await uploadToSupabaseNative(
      bucket,
      fileName,
      finalBuffer,
      contentType,
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
    console.error('Compression & upload error:', err);
    return { url: null, error: err.message || 'Erreur lors du traitement de l\'image' };
  }
}

# 📸 Image Optimization Kit — Next.js + Supabase + Sharp

## What This Kit Does

A complete, production-tested image optimization system for Next.js e-commerce projects using Supabase Storage. It provides:

1. **Automatic optimization on upload** — Every image added to a product (new or existing) is automatically compressed to WebP via `sharp` on the server before being stored in Supabase. No manual optimization needed.

2. **Admin optimization dashboard** — A full admin page to analyze, scan, and bulk-optimize all existing images already in your database. Supports selective scanning (pick which images to analyze) and one-click optimization.

3. **Native HTTPS uploads** — Bypasses Next.js's patched `fetch` and the Supabase JS client for binary uploads, preventing data corruption that commonly occurs with large image files.

---

## Tech Stack Requirements

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14+ (App Router) | Framework |
| **Supabase** | Any | Database + Storage |
| **sharp** | Any | Server-side image compression |
| **TypeScript** | Any | Type safety |

### Required npm packages
```bash
npm install sharp
npm install @supabase/supabase-js @supabase/ssr
```

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER UPLOADS IMAGE                       │
│              (from phone gallery, file picker)               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CLIENT-SIDE (optional pre-compress)             │
│  Canvas-based resize to WebP as a "first pass" to reduce    │
│  the size sent over the network to the server action.       │
│  File: NewProductForm.tsx / EditProductClient.tsx            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SERVER ACTION (admin.ts)                         │
│  compressAndUploadImage():                                   │
│  1. Reads File → Buffer                                      │
│  2. sharp: resize 800px max + WebP quality 75                │
│  3. Native HTTPS POST to Supabase Storage                    │
│  4. Returns optimized public URL                             │
│  Result: ~20-80 Ko WebP image (from 2000+ Ko original)      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE STORAGE                                │
│  Bucket: "products" (public)                                 │
│  Files: productId-color-random-opt-timestamp.webp            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (product_images table)                  │
│  Stores the optimized public URL                             │
│  { id, product_id, url, color, is_main, display_order }     │
└─────────────────────────────────────────────────────────────┘
```

---

## Files In This Kit

| File | Type | Description |
|---|---|---|
| `README.md` | Documentation | This file — full integration guide |
| `server-actions/optimize.ts` | Server Action | Dashboard: scan sizes, optimize existing images, dry run test |
| `server-actions/compress-and-upload.ts` | Server Utility | Core function: compress + upload any new image via sharp |
| `server-actions/admin-upload-example.ts` | Server Action | Example: how to integrate auto-compression in createProduct / updateProduct |
| `client/optimize-images-page.tsx` | React Component | Full admin optimization dashboard with selection |
| `client/compress-client-side.ts` | Utility | Optional client-side canvas pre-compression (reduces network payload) |
| `database/product_images_schema.sql` | SQL | Required table schema for product_images |
| `database/storage_bucket.sql` | SQL | Required Supabase storage bucket setup |
| `utils/supabase-server.ts` | Utility | Supabase admin client (bypasses RLS) |

---

## Integration Guide (Step by Step)

### Step 1: Database Setup

Run the SQL in `database/product_images_schema.sql` to create the `product_images` table (if not already exists). Then run `database/storage_bucket.sql` to create the storage bucket.

### Step 2: Install sharp

```bash
npm install sharp
```

### Step 3: Add the Supabase Admin Client

Copy `utils/supabase-server.ts` to your project's utils folder. This creates a Supabase client using the **Service Role Key** that bypasses Row Level Security (needed for server-side uploads).

### Step 4: Add Auto-Compression to Your Upload Logic

In your server action that handles product creation/update, replace direct Supabase Storage uploads with the `compressAndUploadImage()` function from `server-actions/compress-and-upload.ts`.

**Before (raw upload, no optimization):**
```typescript
const { error } = await supabase.storage
  .from('products')
  .upload(fileName, imageFile);

const { data } = supabase.storage
  .from('products')
  .getPublicUrl(fileName);
```

**After (automatic sharp optimization):**
```typescript
import { compressAndUploadImage } from './compress-and-upload';

const storageName = `${productId}-${colorName}-${Math.random()}`;
const { url, error } = await compressAndUploadImage(imageFile, storageName);
// url is already the optimized public URL
```

See `server-actions/admin-upload-example.ts` for a complete working example.

### Step 5: Add the Optimization Dashboard

1. Copy `server-actions/optimize.ts` to `src/app/actions/optimize.ts`
2. Copy `client/optimize-images-page.tsx` to `src/app/admin/optimize-images/page.tsx`
3. Add a link to `/admin/optimize-images` in your admin sidebar

### Step 6 (Optional): Add Client-Side Pre-Compression

Copy the `compressImage` function from `client/compress-client-side.ts` into your product form components. Call it before appending files to FormData:

```typescript
const compressed = await compressImage(file);
formData.append('image_color', compressed);
```

This reduces the size sent over the network but the server-side sharp compression is the real optimization.

---

## Compression Settings

All compression uses these settings (defined in the sharp calls):

| Setting | Value | Why |
|---|---|---|
| **Format** | WebP | Best size/quality ratio for web |
| **Max Width** | 800px | Enough for product photos on e-commerce sites |
| **Quality** | 75 | Good visual quality at small file size |
| **withoutEnlargement** | true | Never upscale small images |

Typical results:
- **Phone photo (3-5 MB JPEG)** → **40-120 Ko WebP**
- **Gallery image (1-2 MB PNG)** → **20-80 Ko WebP**
- **Already small image (< 200 Ko)** → stays roughly the same or slightly smaller

---

## Important Technical Notes

### Why Native HTTPS Instead of Supabase Client?

Next.js patches the global `fetch()` function, which can corrupt binary data during upload. The Supabase JS client uses `fetch` internally. By using Node.js's native `https.request()`, we completely bypass this issue. This was discovered after debugging corrupted WebP uploads that looked valid but wouldn't render.

### Why Server-Side Sharp Instead of Client-Side Canvas?

1. **Canvas compression quality varies** across browsers and devices — especially on mobile
2. **Canvas can't produce true WebP** on all browsers (falls back to PNG/JPEG)
3. **Sharp is deterministic** — same output every time regardless of client
4. **Phone gallery images** often bypass the canvas compression in certain browser contexts

### The "products" Bucket Must Be Public

The storage bucket must be set as `public: true` so product images can be displayed without authentication tokens. The SQL in `database/storage_bucket.sql` handles this.

---

## Adapting to Your Project

### Different Image Table Name
If your images table isn't called `product_images`, do a find-and-replace in:
- `optimize.ts` — change `.from('product_images')` references
- `compress-and-upload.ts` — no changes needed (it doesn't touch the DB)

### Different Storage Bucket Name
If your bucket isn't called `products`, change the bucket name in:
- `compress-and-upload.ts` — the `'products'` string in `uploadToSupabaseNative()`
- `optimize.ts` — the `'products'` strings and the `'/products/'` bucket marker

### Different Compression Settings
Adjust the sharp pipeline in both `compress-and-upload.ts` and `optimize.ts`:
```typescript
.resize({ width: 1200, withoutEnlargement: true })  // bigger images
.webp({ quality: 85 })                               // higher quality
```

### Adding to Admin Sidebar
Add a link to your admin layout/sidebar:
```tsx
<Link href="/admin/optimize-images">📸 Optimisation Images</Link>
```

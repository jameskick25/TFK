/**
 * ══════════════════════════════════════════════════════════════
 *  SUPABASE SERVER CLIENT — Admin (Service Role) Client
 * ══════════════════════════════════════════════════════════════
 * 
 *  Creates a Supabase client using the Service Role Key.
 *  This client BYPASSES Row Level Security (RLS), which is needed
 *  for server-side admin operations like:
 *    - Inserting/updating product_images
 *    - Deleting old files from storage
 *    - Reading all data regardless of RLS policies
 * 
 *  This file should be placed at: src/utils/supabase/server.ts
 *  (or wherever your project keeps Supabase utility files)
 * 
 *  Dependencies:
 *    - @supabase/supabase-js
 *    - @supabase/ssr (only needed for the cookie-based client)
 * 
 *  Environment variables required:
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY (for the regular client)
 *    - SUPABASE_SERVICE_ROLE_KEY (for the admin client)
 * ══════════════════════════════════════════════════════════════
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createBaseClient } from '@supabase/supabase-js'

/**
 * Regular server client (uses cookies for auth, respects RLS).
 * Use this for user-facing operations where you want RLS protection.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Can be ignored from Server Components
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Can be ignored from Server Components
          }
        },
      },
    }
  )
}

/**
 * Admin client (uses Service Role Key, BYPASSES RLS).
 * Use this for server-side admin operations like image optimization.
 * 
 * IMPORTANT: This client has full access to your database.
 * Never expose it to client-side code.
 */
export async function createAdminClient() {
  return createBaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

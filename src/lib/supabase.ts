import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getPublicEnv } from './demo-mode';

export const SUPABASE_MEDIA_BUCKET = 'COFKANSELECTRICALS';

type MediaFolder = 'Products' | 'Categories' | 'Site';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = getPublicEnv('SUPABASE_URL').trim();
  const supabaseAnonKey = getPublicEnv('SUPABASE_ANON_KEY').trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase configuration. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

function safeFileName(fileName: string): string {
  const fallback = 'media';
  const normalized = fileName
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || fallback;
}

export async function confirmPublicMediaBucket(): Promise<{ name: string; isPublic: boolean }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.getBucket(SUPABASE_MEDIA_BUCKET);

  if (error) {
    throw new Error(`Supabase media bucket "${SUPABASE_MEDIA_BUCKET}" is not accessible: ${error.message}`);
  }

  return {
    name: data.name,
    isPublic: Boolean(data.public),
  };
}

export async function uploadPublicMedia(
  file: File,
  options: { folder?: MediaFolder; pathPrefix?: string; upsert?: boolean } = {},
): Promise<{ bucket: string; path: string; publicUrl: string }> {
  const supabase = getSupabaseClient();
  const folder = options.folder ?? 'Products';
  const prefix = options.pathPrefix ? `${safeFileName(options.pathPrefix)}/` : '';
  const path = `${folder}/${prefix}${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;

  const { error } = await supabase.storage
    .from(SUPABASE_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type || undefined,
      upsert: options.upsert ?? false,
    });

  if (error) {
    throw new Error(`Supabase media upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(SUPABASE_MEDIA_BUCKET).getPublicUrl(path);

  if (!data.publicUrl) {
    throw new Error(`Supabase did not return a public URL for "${path}".`);
  }

  return {
    bucket: SUPABASE_MEDIA_BUCKET,
    path,
    publicUrl: data.publicUrl,
  };
}

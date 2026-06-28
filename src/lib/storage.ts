import { randomUUID } from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * S3-compatible object storage (Tigris) for chat media (voice messages, etc.).
 *
 * Why: previously voice notes were sent as base64 over the socket and stored
 * inline in Postgres `messages.content`. That bloats the DB, slows every chat
 * history query, and pushes large payloads through the Node process. Now the
 * client uploads the raw audio directly to object storage via a short-lived
 * presigned URL and we only persist/transmit the small public URL.
 */

let _client: S3Client | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    env.S3_ENDPOINT &&
      env.S3_BUCKET &&
      env.S3_ACCESS_KEY_ID &&
      env.S3_SECRET_ACCESS_KEY,
  );
}

function getClient(): S3Client {
  if (_client) return _client;
  _client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION || 'auto',
    // Path-style keeps us compatible across S3 providers (Tigris, R2, MinIO…).
    forcePathStyle: true,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY as string,
    },
  });
  return _client;
}

/** Build the public URL for a stored object key. */
export function publicUrlForKey(key: string): string {
  if (env.S3_PUBLIC_BASE_URL) {
    return `${env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')}/${key}`;
  }
  const endpoint = (env.S3_ENDPOINT || '').replace(/\/$/, '');
  return `${endpoint}/${env.S3_BUCKET}/${key}`;
}

const EXT_BY_FOLDER: Record<string, string> = {
  voice: 'm4a',
  image: 'jpg',
};

/**
 * Generate a presigned PUT URL the client can upload directly to.
 * Returns the upload URL (short TTL) plus the final public URL + object key.
 */
export async function createPresignedUpload(opts: {
  folder: 'voice' | 'image';
  contentType: string;
  ext?: string;
  coupleId?: string;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  if (!isStorageConfigured()) {
    throw new Error('Object storage is not configured');
  }

  const ext = (opts.ext || EXT_BY_FOLDER[opts.folder] || 'bin').replace(/^\./, '');
  const safeCouple = (opts.coupleId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '');
  const key = `${opts.folder}/${safeCouple}/${Date.now()}-${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ContentType: opts.contentType,
  });

  const uploadUrl = await getSignedUrl(getClient(), command, {
    expiresIn: opts.expiresInSeconds ?? 300,
  });

  return { uploadUrl, publicUrl: publicUrlForKey(key), key };
}

/**
 * Generate a presigned GET URL for an existing object so the client can
 * download/play it. The bucket is private, so playback always goes through a
 * short-lived signed URL (the client caches the downloaded file locally).
 */
export async function createPresignedDownload(
  key: string,
  expiresInSeconds = 6 * 60 * 60,
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error('Object storage is not configured');
  }
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key });
  return getSignedUrl(getClient(), command, { expiresIn: expiresInSeconds });
}

/** Server-side upload of a buffer (used as a fallback path). */
export async function uploadBuffer(opts: {
  folder: 'voice' | 'image';
  buffer: Buffer;
  contentType: string;
  ext?: string;
  coupleId?: string;
}): Promise<{ publicUrl: string; key: string }> {
  if (!isStorageConfigured()) {
    throw new Error('Object storage is not configured');
  }
  const ext = (opts.ext || EXT_BY_FOLDER[opts.folder] || 'bin').replace(/^\./, '');
  const safeCouple = (opts.coupleId || 'anon').replace(/[^a-zA-Z0-9_-]/g, '');
  const key = `${opts.folder}/${safeCouple}/${Date.now()}-${randomUUID()}.${ext}`;

  await getClient().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: opts.buffer,
      ContentType: opts.contentType,
    }),
  );
  return { publicUrl: publicUrlForKey(key), key };
}

/** Best-effort delete (e.g. when a media message is deleted). Never throws. */
export async function deleteObjectByUrlOrKey(urlOrKey: string): Promise<void> {
  try {
    if (!isStorageConfigured() || !urlOrKey) return;
    let key = urlOrKey;
    if (urlOrKey.startsWith('http')) {
      // Strip endpoint/bucket prefix to recover the object key.
      const base = env.S3_PUBLIC_BASE_URL
        ? env.S3_PUBLIC_BASE_URL.replace(/\/$/, '')
        : `${(env.S3_ENDPOINT || '').replace(/\/$/, '')}/${env.S3_BUCKET}`;
      key = urlOrKey.startsWith(base)
        ? urlOrKey.slice(base.length + 1)
        : new URL(urlOrKey).pathname.replace(/^\//, '');
    }
    if (!key) return;
    await getClient().send(
      new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }),
    );
  } catch (err) {
    logger.warn('[storage] deleteObject failed (ignored):', err);
  }
}

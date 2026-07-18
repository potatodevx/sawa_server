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

/**
 * Images require a DEDICATED public bucket + public base URL. Until both are
 * set we must NOT move images to S3 (they would land in the private voice
 * bucket and serve 403). When false, image writes safely keep storing base64,
 * exactly as before — so this can deploy ahead of the bucket being created.
 */
export function isImageStorageConfigured(): boolean {
  return Boolean(
    isStorageConfigured() && env.S3_IMAGE_BUCKET && env.S3_IMAGE_PUBLIC_BASE_URL,
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

/** True for object keys that live in the public image bucket. */
function isImageKey(key: string): boolean {
  return key.startsWith('image/');
}

/** Resolve which bucket an object key belongs to. */
function bucketForKey(key: string): string | undefined {
  return isImageKey(key) ? env.S3_IMAGE_BUCKET || env.S3_BUCKET : env.S3_BUCKET;
}

function bucketForFolder(folder: 'voice' | 'image'): string | undefined {
  return folder === 'image' ? env.S3_IMAGE_BUCKET || env.S3_BUCKET : env.S3_BUCKET;
}

/**
 * Build the public URL for a stored object key.
 * Image keys resolve against the dedicated public image bucket / CDN base URL;
 * everything else (voice) uses the private bucket base (only meaningful for
 * presigned access).
 */
export function publicUrlForKey(key: string): string {
  const isImage = isImageKey(key);
  const base = isImage ? env.S3_IMAGE_PUBLIC_BASE_URL : env.S3_PUBLIC_BASE_URL;
  if (base) {
    return `${base.replace(/\/$/, '')}/${key}`;
  }
  const endpoint = (env.S3_ENDPOINT || '').replace(/\/$/, '');
  const bucket = bucketForKey(key);
  return `${endpoint}/${bucket}/${key}`;
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
    Bucket: bucketForFolder(opts.folder),
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
      Bucket: bucketForFolder(opts.folder),
      Key: key,
      Body: opts.buffer,
      ContentType: opts.contentType,
    }),
  );
  return { publicUrl: publicUrlForKey(key), key };
}

/**
 * Convert a base64 data-URI image into an S3 object and return its public URL.
 * - Already-a-URL (http…) or empty values are returned unchanged.
 * - If storage is not configured, or the upload fails, the original base64 is
 *   returned so nothing ever breaks (graceful degradation / incremental rollout).
 * This is the single choke point that keeps ~0.5 MB base64 blobs out of Postgres.
 */
export async function materializeImage(
  value: string | null | undefined,
  coupleId?: string,
): Promise<string | null | undefined> {
  if (!value || typeof value !== 'string') return value;
  if (!value.startsWith('data:')) return value; // already a URL (or non-image) — leave as-is
  if (!isImageStorageConfigured()) return value; // no public image bucket yet → keep base64
  try {
    const match = /^data:([^;]+);base64,(.*)$/s.exec(value);
    if (!match) return value;
    const contentType = match[1] || 'image/jpeg';
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length) return value;
    const ext = (contentType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
    const { publicUrl } = await uploadBuffer({ folder: 'image', buffer, contentType, ext, coupleId });
    return publicUrl;
  } catch (err) {
    logger.warn('[storage] materializeImage failed — keeping base64:', err);
    return value;
  }
}

/**
 * Like materializeImage but also accepts a RAW base64 string (no data: prefix)
 * and already-stored http URLs. Returns an S3 URL for base64 inputs, or the
 * value unchanged when it's already a URL / empty.
 */
export async function materializeImageLoose(
  value: string | null | undefined,
  coupleId?: string,
): Promise<string | null | undefined> {
  if (!value || typeof value !== 'string') return value;
  if (value.startsWith('http')) return value;
  const dataUri = value.startsWith('data:') ? value : `data:image/jpeg;base64,${value}`;
  return (await materializeImage(dataUri, coupleId)) ?? value;
}

/** Materialize an array of images (secondary photos). Preserves order + count. */
export async function materializeImages(
  values: (string | null | undefined)[] | null | undefined,
  coupleId?: string,
): Promise<string[]> {
  if (!values || !values.length) return [];
  const out = await Promise.all(
    values.map((v) => materializeImage(v, coupleId).then((r) => (r as string) ?? (v as string))),
  );
  return out.filter((v): v is string => Boolean(v));
}

/** Best-effort delete (e.g. when a media message is deleted). Never throws. */
export async function deleteObjectByUrlOrKey(urlOrKey: string): Promise<void> {
  try {
    if (!isStorageConfigured() || !urlOrKey) return;
    let key = urlOrKey.startsWith('s3:') ? urlOrKey.slice(3) : urlOrKey;
    if (key.startsWith('http')) {
      // Strip a known public base URL (image or voice) to recover the object key.
      const candidates = [env.S3_IMAGE_PUBLIC_BASE_URL, env.S3_PUBLIC_BASE_URL]
        .filter(Boolean)
        .map((b) => (b as string).replace(/\/$/, ''));
      const matched = candidates.find((b) => key.startsWith(b));
      key = matched
        ? key.slice(matched.length + 1)
        : new URL(key).pathname.replace(/^\//, '').replace(new RegExp(`^${env.S3_IMAGE_BUCKET || env.S3_BUCKET}/`), '').replace(new RegExp(`^${env.S3_BUCKET}/`), '');
    }
    if (!key) return;
    await getClient().send(
      new DeleteObjectCommand({ Bucket: bucketForKey(key), Key: key }),
    );
  } catch (err) {
    logger.warn('[storage] deleteObject failed (ignored):', err);
  }
}

import type { Readable } from 'stream';
export declare function isStorageConfigured(): boolean;
/**
 * Images are stored in the SAME (private) bucket under the `image/` prefix and
 * served back through our own `/img/<key>` proxy endpoint — so no public bucket
 * or dashboard config is required. We only need object storage + a base URL
 * (APP_URL) to build the stable proxy links. When false, image writes safely
 * keep storing base64 exactly as before (graceful, deploy-ahead-safe).
 */
export declare function isImageStorageConfigured(): boolean;
/**
 * Build the URL stored for an object key.
 * - Images → a STABLE proxy URL on our own server (`<APP_URL>/img/<key>`) that
 *   streams the object from the private bucket with long cache headers. This
 *   needs no public bucket and lets the app cache images by URL.
 * - Everything else (voice) → the raw bucket URL (only used for presigned access).
 */
export declare function publicUrlForKey(key: string): string;
/**
 * Stream an object out of the (private) bucket — used by the public /img proxy.
 * Returns null when storage is unavailable or the object is missing.
 */
export declare function getObjectStream(key: string): Promise<{
    body: Readable;
    contentType?: string;
    contentLength?: number;
} | null>;
/**
 * Generate a presigned PUT URL the client can upload directly to.
 * Returns the upload URL (short TTL) plus the final public URL + object key.
 */
export declare function createPresignedUpload(opts: {
    folder: 'voice' | 'image';
    contentType: string;
    ext?: string;
    coupleId?: string;
    expiresInSeconds?: number;
}): Promise<{
    uploadUrl: string;
    publicUrl: string;
    key: string;
}>;
/**
 * Generate a presigned GET URL for an existing object so the client can
 * download/play it. The bucket is private, so playback always goes through a
 * short-lived signed URL (the client caches the downloaded file locally).
 */
export declare function createPresignedDownload(key: string, expiresInSeconds?: number): Promise<string>;
/** Server-side upload of a buffer (used as a fallback path). */
export declare function uploadBuffer(opts: {
    folder: 'voice' | 'image';
    buffer: Buffer;
    contentType: string;
    ext?: string;
    coupleId?: string;
}): Promise<{
    publicUrl: string;
    key: string;
}>;
/**
 * Convert a base64 data-URI image into an S3 object and return its public URL.
 * - Already-a-URL (http…) or empty values are returned unchanged.
 * - If storage is not configured, or the upload fails, the original base64 is
 *   returned so nothing ever breaks (graceful degradation / incremental rollout).
 * This is the single choke point that keeps ~0.5 MB base64 blobs out of Postgres.
 */
export declare function materializeImage(value: string | null | undefined, coupleId?: string): Promise<string | null | undefined>;
/**
 * Like materializeImage but also accepts a RAW base64 string (no data: prefix)
 * and already-stored http URLs. Returns an S3 URL for base64 inputs, or the
 * value unchanged when it's already a URL / empty.
 */
export declare function materializeImageLoose(value: string | null | undefined, coupleId?: string): Promise<string | null | undefined>;
/** Materialize an array of images (secondary photos). Preserves order + count. */
export declare function materializeImages(values: (string | null | undefined)[] | null | undefined, coupleId?: string): Promise<string[]>;
/** Best-effort delete (e.g. when a media message is deleted). Never throws. */
export declare function deleteObjectByUrlOrKey(urlOrKey: string): Promise<void>;
//# sourceMappingURL=storage.d.ts.map
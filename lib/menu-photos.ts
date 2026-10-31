import { DomainError } from "./domain.ts";
import type { MenuImage } from "./claude-menu.ts";

export async function storeMenuPhoto(bucket: R2Bucket | undefined, boothId: string, image: MenuImage) {
  if (!bucket) throw new DomainError("PHOTO_STORAGE_UNAVAILABLE", 503);
  const extension = image.media_type === "image/jpeg" ? "jpg" : image.media_type.split("/")[1];
  const photoId = `${crypto.randomUUID()}.${extension}`;
  try {
    const bytes = Uint8Array.from(atob(image.data), char => char.charCodeAt(0));
    await bucket.put(`menu-photos/${boothId}/${photoId}`, bytes, { httpMetadata: { contentType: image.media_type } });
  } catch { throw new DomainError("PHOTO_STORAGE_UNAVAILABLE", 503); }
  return `/api/booths/${boothId}/photos/${photoId}`;
}

export async function readMenuPhoto(bucket: R2Bucket | undefined, boothId: string, photoId: string) {
  if (!bucket || !/^[a-f0-9-]{36}\.(jpg|png|webp)$/.test(photoId)) throw new DomainError("NOT_FOUND", 404);
  const object = await bucket.get(`menu-photos/${boothId}/${photoId}`);
  if (!object) throw new DomainError("NOT_FOUND", 404);
  const headers = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  return new Response(object.body, { headers });
}

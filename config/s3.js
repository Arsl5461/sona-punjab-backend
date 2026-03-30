import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

let client = null;

function getRegion() {
  return process.env.AWS_REGION;
}

function getBucket() {
  return process.env.S3_BUCKET_NAME;
}

function getClient() {
  const region = getRegion();
  const bucket = getBucket();
  if (!region || !bucket) {
    throw new Error(
      "Missing AWS S3 config: set AWS_REGION and S3_BUCKET_NAME in .env"
    );
  }
  if (!client) {
    client = new S3Client({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

/** Public URL for an object key (virtual-hosted–style). */
export function publicUrlForKey(key) {
  const base = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (base) {
    return `${base}/${key}`;
  }
  const bucket = getBucket();
  const region = getRegion();
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function buildKey(folder, originalName) {
  const ext = path.extname(originalName || "") || ".jpg";
  const name = `${crypto.randomBytes(16).toString("hex")}${ext}`;
  const prefix = process.env.S3_KEY_PREFIX
    ? `${process.env.S3_KEY_PREFIX.replace(/\/$/, "")}/`
    : "";
  return `${prefix}${folder}/${name}`;
}

/**
 * Upload a buffer to S3. Returns the public URL stored in the DB.
 */
export async function uploadBuffer({ buffer, originalName, contentType, folder }) {
  const key = buildKey(folder, originalName);
  const s3 = getClient();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: contentType || "application/octet-stream",
    })
  );
  return publicUrlForKey(key);
}

/** Legacy URLs served from this app’s /uploads — not on S3. */
function isLegacyLocalUploadUrl(url) {
  if (!url || typeof url !== "string") return true;
  return /localhost|127\.0\.0\.1|\/uploads\//i.test(url);
}

function keyFromPublicUrl(fileUrl) {
  try {
    const u = new URL(fileUrl);
    return decodeURIComponent(u.pathname.replace(/^\//, ""));
  } catch {
    return null;
  }
}

/**
 * Delete object if URL points to this bucket (or custom public base). Safe no-op for legacy local URLs.
 */
export async function deleteFileByUrl(fileUrl) {
  if (!fileUrl || isLegacyLocalUploadUrl(fileUrl)) return;
  const publicBase = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (publicBase && fileUrl.startsWith(publicBase)) {
    const key = fileUrl.slice(publicBase.length + 1);
    if (!key) return;
    try {
      await getClient().send(
        new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
      );
    } catch (e) {
      console.error("S3 delete failed:", e.message);
    }
    return;
  }
  if (!fileUrl.includes(".amazonaws.com") && !fileUrl.includes(getBucket())) {
    return;
  }
  const key = keyFromPublicUrl(fileUrl);
  if (!key) return;
  try {
    await getClient().send(
      new DeleteObjectCommand({ Bucket: getBucket(), Key: key })
    );
  } catch (e) {
    console.error("S3 delete failed:", e.message);
  }
}

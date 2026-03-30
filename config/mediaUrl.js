/**
 * Rewrites legacy app-hosted /uploads/ URLs to the public S3 (or CDN) base.
 * Strips localhost, Render host, etc. when the path was stored as .../uploads/...
 */

function getPublicMediaBase() {
  const explicit = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (explicit) return explicit;
  const bucket = process.env.S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) return null;
  const prefix = process.env.S3_KEY_PREFIX?.replace(/^\/|\/$/g, "");
  return prefix
    ? `https://${bucket}.s3.${region}.amazonaws.com/${prefix}`
    : `https://${bucket}.s3.${region}.amazonaws.com`;
}

/**
 * @param {string | undefined | null} url
 * @returns {string | undefined | null}
 */
export function normalizeMediaUrl(url) {
  if (url == null || typeof url !== "string") return url;
  const trimmed = url.trim();
  if (!trimmed) return url;

  const lower = trimmed.toLowerCase();
  if (lower.includes(".amazonaws.com")) return trimmed;
  const publicBase = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "");
  if (publicBase && trimmed.startsWith(publicBase)) return trimmed;

  const uploadsIdx = lower.indexOf("/uploads/");
  if (uploadsIdx === -1) return trimmed;

  const base = getPublicMediaBase();
  if (!base) return trimmed;

  let suffix = trimmed.slice(uploadsIdx + "/uploads/".length);
  suffix = suffix.split(/[?#]/)[0].replace(/^\/+/, "");
  if (!suffix) return trimmed;
  return `${base.replace(/\/$/, "")}/${suffix}`;
}

export function normalizeOwnerDoc(owner) {
  if (!owner) return owner;
  const o = owner.toObject?.() ?? { ...owner };
  if (o.ownerPicture) o.ownerPicture = normalizeMediaUrl(o.ownerPicture);
  return o;
}

export function normalizeBannerDoc(banner) {
  if (!banner) return banner;
  const b = banner.toObject?.() ?? { ...banner };
  if (b.bannerPicture) b.bannerPicture = normalizeMediaUrl(b.bannerPicture);
  return b;
}

export function normalizeTournamentDoc(t) {
  if (!t) return t;
  const doc = t.toObject?.() ?? { ...t };
  if (doc.tournamentPicture) {
    doc.tournamentPicture = normalizeMediaUrl(doc.tournamentPicture);
  }
  return doc;
}

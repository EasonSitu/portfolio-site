// Static assets are plain URLs, so they need the Pages prefix explicitly.
// The Pages workflow sets this value to /portfolio-site; local and Vultr builds
// leave it empty and therefore resolve assets from the domain root.
export const PUBLIC_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

export function withPublicBasePath(path, basePath = PUBLIC_BASE_PATH) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = basePath.replace(/\/$/, "");
  return `${normalizedBase}${normalizedPath}` || "/";
}

export function withPublicSiteUrl(path, siteUrl = PUBLIC_SITE_URL) {
  const publicPath = withPublicBasePath(path);
  const normalizedSiteUrl = siteUrl.replace(/\/$/g, "");
  return normalizedSiteUrl ? `${normalizedSiteUrl}${publicPath}` : publicPath;
}

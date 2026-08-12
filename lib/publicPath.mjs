// GitHub Pages serves this repository below /portfolio-site/; local and custom
// domain previews stay at the root. Keeping this in one helper prevents assets
// such as the CV, manifest and favicon from silently pointing at the wrong path.
export const PUBLIC_BASE_PATH =
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.GITHUB_ACTIONS === "true" ? "/portfolio-site" : "");

export function withPublicBasePath(path, basePath = PUBLIC_BASE_PATH) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBase = basePath.replace(/\/$/, "");
  return `${normalizedBase}${normalizedPath}` || "/";
}

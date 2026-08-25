// GitHub Actions is also used by the Vultr build, so the deployment target
// must be explicit instead of inferring GitHub Pages from GITHUB_ACTIONS.
const deploymentTarget = process.env.DEPLOY_TARGET || "local";
const isGitHubPagesBuild = deploymentTarget === "github-pages";
const basePath = isGitHubPagesBuild
  ? process.env.NEXT_PUBLIC_BASE_PATH || "/portfolio-site"
  : deploymentTarget === "preview"
    ? process.env.NEXT_PUBLIC_BASE_PATH || ""
    : "";

const nextConfig = {
  // Export static HTML/CSS/JS so GitHub Pages can host the site without a Node server.
  output: "export",
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

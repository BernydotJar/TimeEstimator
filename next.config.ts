import type { NextConfig } from "next";
import path from "path";

const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = isGithubActions && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isGithubActions ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  webpack: (config) => {
    if (isGithubActions) {
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "@/ai/flows/estimate-analysis-flow": path.join(
          process.cwd(),
          "src/ai/stubs/estimate-analysis-flow.ts",
        ),
        "@/ai/flows/estimate-defaults-flow": path.join(
          process.cwd(),
          "src/ai/stubs/estimate-defaults-flow.ts",
        ),
        "@/ai/flows/estimate-summary-flow": path.join(
          process.cwd(),
          "src/ai/stubs/estimate-summary-flow.ts",
        ),
        "@/ai/flows/parse-steps-flow": path.join(
          process.cwd(),
          "src/ai/stubs/parse-steps-flow.ts",
        ),
      };
    }

    return config;
  },
};

export default nextConfig;

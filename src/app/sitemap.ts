import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const repository =
  process.env.GITHUB_REPOSITORY ?? "BernydotJar/TimeEstimator";
const [repositoryOwner = "BernydotJar", repositoryName = "TimeEstimator"] =
  repository.split("/");
const ownerSlug = repositoryOwner.toLowerCase();
const siteUrl = `https://${ownerSlug}.github.io/${repositoryName}`;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

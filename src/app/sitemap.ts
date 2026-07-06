import type { MetadataRoute } from "next";

const siteUrl = "https://www.1do.io";

const routes = [
  "",
  "/privacy",
  "/terms",
  "/support",
  "/en/whitepaper",
  "/zh/whitepaper",
  "/guide/zh",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date("2026-07-06"),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}

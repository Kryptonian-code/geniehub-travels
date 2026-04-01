import { describe, expect, it } from "vitest";
import { getBlogPosts, getSettings, saveBlogPost } from "@/lib/backend";
import { slugify } from "@/lib/validation";

describe("local backend bootstrap", () => {
  it("returns GenieHub as the default brand", async () => {
    const settings = await getSettings();
    expect(settings.brandName).toBe("GenieHub");
  });

  it("saves and reloads blog content for the public site", async () => {
    await saveBlogPost({
      id: "test-post",
      title: "Testing the GenieHub blog flow",
      slug: "testing-the-geniehub-blog-flow",
      category: "updates",
      excerpt: "A short excerpt for the test post.",
      content: "This post confirms the local save and reload flow works.",
      author: "QA",
      published: true,
      publishedAt: new Date().toISOString(),
    });
    const posts = await getBlogPosts();
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((post) => post.slug === "testing-the-geniehub-blog-flow")).toBe(true);
  });

  it("creates clean blog slugs for admin drafts", () => {
    expect(slugify("  Visa Interview Checklist 2026! ")).toBe("visa-interview-checklist-2026");
  });
});

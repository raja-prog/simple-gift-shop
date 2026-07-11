import { describe, it, expect } from "vitest";
import {
  normalizeImageUrl,
  isDisplayableRemote,
  cleanImageUrl,
} from "@/lib/image";

describe("normalizeImageUrl", () => {
  it("returns undefined for empty input", () => {
    expect(normalizeImageUrl(undefined)).toBeUndefined();
    expect(normalizeImageUrl(null)).toBeUndefined();
    expect(normalizeImageUrl("")).toBeUndefined();
  });

  it("trims whitespace", () => {
    expect(normalizeImageUrl("  https://x.com/a.jpg  ")).toBe(
      "https://x.com/a.jpg"
    );
  });

  it("adds https to protocol-less URLs", () => {
    expect(normalizeImageUrl("//x.com/a.jpg")).toBe("https://x.com/a.jpg");
  });

  it("resolves google imgres redirect to the original image url", () => {
    const original = "https://cdn.example.com/photo.jpg";
    const g = `https://www.google.com/imgres?imgurl=${encodeURIComponent(
      original
    )}&foo=bar`;
    expect(normalizeImageUrl(g)).toBe(original);
  });

  it("passes through data URLs unchanged", () => {
    const d = "data:image/png;base64,AAAA";
    expect(normalizeImageUrl(d)).toBe(d);
  });

  it("cleanImageUrl is an alias of normalizeImageUrl", () => {
    expect(cleanImageUrl).toBe(normalizeImageUrl);
  });
});

describe("isDisplayableRemote", () => {
  it("returns false for empty", () => {
    expect(isDisplayableRemote(undefined)).toBe(false);
  });

  it("allows data URLs", () => {
    expect(isDisplayableRemote("data:image/png;base64,AAAA")).toBe(true);
  });

  it("allows allowlisted hosts", () => {
    expect(isDisplayableRemote("https://images.unsplash.com/x.jpg")).toBe(true);
    expect(isDisplayableRemote("https://placehold.co/600x600")).toBe(true);
  });

  it("rejects non-allowlisted hosts", () => {
    expect(isDisplayableRemote("https://evil.example.com/x.jpg")).toBe(false);
  });

  it("rejects non-http schemes", () => {
    expect(isDisplayableRemote("ftp://x.com/a.jpg")).toBe(false);
  });

  it("rejects unresolved google redirects", () => {
    expect(isDisplayableRemote("https://google.com/imgres?foo=bar")).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "@/components/HeroSection";

describe("HeroSection", () => {
  it("points the Explore CTA to /collections (not a single category)", () => {
    render(<HeroSection firstCategoryId="F" />);
    const links = screen.getAllByRole("link", { name: /explore collections/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute("href", "/collections");
      expect(link.getAttribute("href")).not.toContain("/categories/");
    }
  });

  it("hides the CTA when there are no categories", () => {
    render(<HeroSection />);
    expect(
      screen.queryByRole("link", { name: /explore collections/i })
    ).toBeNull();
  });

  it("renders the editorial headline", () => {
    render(<HeroSection firstCategoryId="F" />);
    expect(screen.getAllByRole("heading", { level: 1 }).length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("links 'Browse Collections' to /collections", () => {
    render(<Footer />);
    const link = screen.getByRole("link", { name: /browse collections/i });
    expect(link).toHaveAttribute("href", "/collections");
  });

  it("renders a WhatsApp contact link", () => {
    render(<Footer />);
    const wa = screen.getByRole("link", { name: /chat on whatsapp/i });
    expect(wa.getAttribute("href")).toContain("wa.me/");
  });
});

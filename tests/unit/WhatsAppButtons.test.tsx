import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WhatsAppButtons } from "@/components/WhatsAppButtons";

describe("WhatsAppButtons", () => {
  it("renders a WhatsApp link for a valid number", () => {
    render(<WhatsAppButtons number="917358978687" message="Hi" />);
    const link = screen.getByRole("link", { name: /order on whatsapp/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("wa.me/917358978687"));
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("shows a hint instead of a link for an invalid number", () => {
    render(<WhatsAppButtons number="123" message="Hi" />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(/valid international whatsapp number/i)).toBeInTheDocument();
  });

  it("does not leak a base64 image into the visible href", () => {
    const msg = "Product XYZ data:image/png;base64,QUJD";
    render(<WhatsAppButtons number="917358978687" message={msg} />);
    const link = screen.getByRole("link");
    const href = link.getAttribute("href") || "";
    expect(href).not.toContain("data:image/png;base64,QUJD");
  });
});

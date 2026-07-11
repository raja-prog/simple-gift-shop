import { describe, it, expect } from "vitest";
import { buildWhatsAppLink } from "@/lib/whatsapp";

describe("buildWhatsAppLink", () => {
  it("builds a wa.me link with encoded message", () => {
    const link = buildWhatsAppLink("917358978687", "Hello there");
    expect(link).toBe("https://wa.me/917358978687?text=Hello%20there");
  });

  it("adds 91 prefix for a bare 10-digit Indian number", () => {
    const link = buildWhatsAppLink("7358978687", "hi");
    expect(link).toContain("https://wa.me/917358978687?text=");
  });

  it("strips a leading zero from a 10-character 0-prefixed number", () => {
    // Regex matches 0 followed by exactly 9 digits; the leading 0 is stripped.
    const link = buildWhatsAppLink("0987654321", "hi");
    expect(link).toContain("wa.me/987654321");
  });

  it("strips spaces, dashes and plus signs", () => {
    const link = buildWhatsAppLink("+91 73589-78687", "hi");
    expect(link).toContain("wa.me/917358978687");
  });

  it("returns empty string for a malformed 91 number", () => {
    expect(buildWhatsAppLink("9173589", "hi")).toBe("");
  });

  it("returns empty string for too-short non-91 numbers", () => {
    expect(buildWhatsAppLink("123", "hi")).toBe("");
  });

  it("returns empty string when number is null/undefined", () => {
    expect(buildWhatsAppLink(null, "hi")).toBe("");
    expect(buildWhatsAppLink(undefined, "hi")).toBe("");
  });

  it("encodes special characters in the message", () => {
    const link = buildWhatsAppLink("917358978687", "₹500 & more?");
    expect(link).toContain(encodeURIComponent("₹500 & more?"));
  });

  it("never embeds a base64 data URL verbatim (encoded only)", () => {
    const msg = "Product data:image/png;base64,AAAA";
    const link = buildWhatsAppLink("917358978687", msg);
    // The raw 'data:image' substring must not appear unencoded in the query.
    const query = link.split("?text=")[1];
    expect(query).not.toContain("data:image/png;base64,AAAA");
  });
});

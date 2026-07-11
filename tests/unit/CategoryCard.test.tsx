import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryCard } from "@/components/CategoryCard";

const previews = [
  { id: "p1", name: "One", image: "https://placehold.co/600x600" },
  { id: "p2", name: "Two", image: "https://placehold.co/600x600" },
  { id: "p3", name: "Three", image: "https://placehold.co/600x600" },
];

describe("CategoryCard", () => {
  it("links to the category page", () => {
    render(
      <CategoryCard category={{ id: "F", name: "Frames" }} previews={previews} />
    );
    const link = screen.getByRole("link", { name: /view frames category/i });
    expect(link).toHaveAttribute("href", "/categories/F");
  });

  it("does NOT render the numeric count badge", () => {
    const { container } = render(
      <CategoryCard category={{ id: "F", name: "Frames" }} previews={previews} />
    );
    // The old badge used the .tilt-badge class showing previews.length ("3").
    expect(container.querySelector(".tilt-badge")).toBeNull();
    expect(screen.queryByText("3")).toBeNull();
  });

  it("renders the category name and CTA", () => {
    render(<CategoryCard category={{ id: "F", name: "Frames" }} previews={[]} />);
    expect(screen.getByText("Frames")).toBeInTheDocument();
    expect(screen.getByText(/view collection/i)).toBeInTheDocument();
  });
});

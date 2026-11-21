import { notFound } from "next/navigation";

// Any address that no other page matches ends here. notFound() shows not-found.tsx
// inside the layout, so the 404 page has the fonts, the colors and the right language.
export default function CatchAllPage() {
  notFound();
}

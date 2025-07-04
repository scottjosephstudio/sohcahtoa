import TypefacesContent from "./TypefacesPageClient";
import HomeIcon from "../../components/home-icon";
import NavigationArrows from "../../components/navigation-arrows";

// Remove Edge Runtime for compatibility
// export const runtime = 'edge';

export const metadata = {
  title: "Typefaces | Scott Joseph Studio",
  description: "",
};

export default function TypefacesPage() {
  return (
    <>
      <TypefacesContent />

      {/* Home icon and navigation arrows with fade-in animation */}
      <HomeIcon />
      <NavigationArrows />
    </>
  );
}

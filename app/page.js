// pages/index.js or app/page.js
import { getAllImages } from "../lib/utils";
import HomePageClient from "./home/HomePageClient";

// Generate static data at build time
export const dynamic = "force-static";

export default async function Home() {
  // Fetch all gallery images at build time
  const allImages = await getAllImages();

  return (
    <>
      <HomePageClient initialImages={allImages} />
    </>
  );
}

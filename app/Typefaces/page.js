import TypefacesContent from "./TypefacesPageClient";
import HomeIcon from "../../components/home-icon";
import NavigationArrows from "../../components/navigation-arrows";
import { getServerUserData } from "../../lib/database/supabaseServer";

// Remove Edge Runtime for compatibility
// export const runtime = 'edge';

export const metadata = {
  title: "Typefaces | Scott Joseph Studio",
  description: "",
};

export default async function TypefacesPage() {
  // Pre-fetch user data on the server side
  const { user, dbData, error } = await getServerUserData();
  
  // Structure the user data to match the client-side format
  const currentUser = user ? {
    ...user,
    dbData: dbData
  } : null;

  return (
    <>
      <TypefacesContent currentUser={currentUser} databaseDataLoaded={!!dbData} />

      {/* Home icon and navigation arrows with fade-in animation */}
      <HomeIcon />
      <NavigationArrows />
    </>
  );
}

// app/ID/page.js
import React from "react";
import TypefacesClient from "./TypefaceClient";
import { getServerUserData } from "../../lib/database/supabaseServer";
import { headers } from "next/headers";

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
      <TypefacesClient currentUser={currentUser} databaseDataLoaded={!!dbData} />
      {/* Preload Typefaces page for faster navigation */}
      <link rel="prefetch" href="/Typefaces" />
    </>
  );
}

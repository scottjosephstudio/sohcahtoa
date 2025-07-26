import React from "react";
import TypefaceClient from "./TypefaceClient";
import { getServerUserData } from "../../../lib/database/supabaseServer";

export const metadata = {
  title: "Typefaces | Scott Joseph Studio",
  description: "",
};

export default async function TypefacePage({ params }) {
  // Pre-fetch user data on the server side
  const { user, dbData, error } = await getServerUserData();
  
  // Structure the user data to match the client-side format
  const currentUser = user ? {
    ...user,
    dbData: dbData
  } : null;

  return (
    <>
      <TypefaceClient 
        currentUser={currentUser} 
        databaseDataLoaded={!!dbData} 
        fontSlug={params.fontname}
      />
    </>
  );
} 
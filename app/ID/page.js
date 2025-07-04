// app/ID/page.js
import React from "react";
import TypefacesClient from "./TypefaceClient";

export const metadata = {
  title: "Typefaces | Scott Joseph Studio",
  description: "",
};

export default function TypefacesPage() {
  return (
    <>
      <TypefacesClient />
    </>
  );
}

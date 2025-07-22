"use client";
import dynamic from "next/dynamic";
const SecureStorageTest = dynamic(() => import("../../components/SecureStorageTest"), { ssr: false });

export default function DevSecurePanel() {
  if (process.env.NODE_ENV !== "development") return null;
  return <SecureStorageTest />;
} 
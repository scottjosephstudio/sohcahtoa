// app/layout.js (Server Component)
import StyledComponentsRegistry from "./config/registry";
import "./globals.css";
import Favicon from "./config/favicon";
import ClientLayout from "./components/ClientLayout";
import DevSecurePanel from "./components/DevSecurePanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: process.env.NEXT_PUBLIC_SITE_NAME || "Scott Joseph Studio",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Typographic Design, London, UK",
  keywords: "Typographic Design, Type Design, Software Development",
  authors: [{ name: process.env.NEXT_PUBLIC_SITE_AUTHOR || "Scott Joseph" }],
  openGraph: {
    title: process.env.NEXT_PUBLIC_SITE_NAME || "Scott Joseph Studio",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Typographic Design, London, UK",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SJ Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: process.env.NEXT_PUBLIC_SITE_NAME || "Scott Joseph Studio",
    description:
      process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
      "Typographic Design, London, UK",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: true,
  },
  themeColor: "#000000",
  icons: {
    icon: [
      {
        url: "/assets/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/assets/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/icons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-36x36.png",
        sizes: "36x36",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/assets/icons/android-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/assets/icons/apple-icon-60x60.png",
        sizes: "60x60",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-72x72.png",
        sizes: "72x72",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-76x76.png",
        sizes: "76x76",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-114x114.png",
        sizes: "114x114",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-120x120.png",
        sizes: "120x120",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-144x144.png",
        sizes: "144x144",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-152x152.png",
        sizes: "152x152",
        type: "image/png",
      },
      {
        url: "/assets/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      { rel: "apple-touch-icon", url: "/assets/icons/apple-icon-57x57.png" },
      { rel: "icon", url: "/favicon.ico" },
      {
        rel: "msapplication-square70x70logo",
        url: "/assets/icons/ms-icon-70x70.png",
      },
      {
        rel: "msapplication-square150x150logo",
        url: "/assets/icons/ms-icon-150x150.png",
      },
      {
        rel: "msapplication-square310x310logo",
        url: "/assets/icons/ms-icon-310x310.png",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Favicon />
        {/* Disable automatic link detection for phone numbers and emails */}
        <meta name="format-detection" content="telephone=no, email=no" />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ClientLayout>{children}</ClientLayout>
        </StyledComponentsRegistry>
        <div className="bottom-blur-overlay"></div>
        {/* <DevSecurePanel /> */}
      </body>
    </html>
  );
}

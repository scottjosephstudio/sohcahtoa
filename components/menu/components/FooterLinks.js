"use client";

import { Fragment } from "react";
import { usePathname } from "next/navigation";
import NavigationLink from "./NavigationLink";
import { getSafeUrl } from "../utils/urlUtils";
import { Footer, FooterLink, VerticalDivider } from "../styles/MenuStyles";

// Footer component extracted to fix hooks order issue
export default function FooterLinks({ links }) {
  const pathname = usePathname();

  return (
    <Footer>
      {links.map((link, index) => {
        // If the link is a relative path, ensure it's handled the same way
        const href = link.link.startsWith("/")
          ? link.link
          : `/${getSafeUrl(link.link)}`;

        // Check if current page matches this link
        const isCurrentPage = pathname === href;

        return (
          <Fragment key={link.name}>
            <FooterLink>
              {isCurrentPage ? (
                // For current page, use non-clickable span
                <span
                  style={{
                    color: "white",
                    cursor: "default",
                    fontSize: "20px",
                    lineHeight: "24px",
                    letterSpacing: "0.6px",
                    textDecoration: "underline",
                    textDecorationColor: "#39ff14",
                    textDecorationThickness: "2px",
                    textUnderlineOffset: "3px",
                    transition: "color 0.3s ease",
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  {link.name}
                </span>
              ) : (
                <NavigationLink href={href} label={link.name} />
              )}
            </FooterLink>
            {index < links.length - 1 && <VerticalDivider />}
          </Fragment>
        );
      })}
    </Footer>
  );
}

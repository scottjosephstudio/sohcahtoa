"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useNavigation } from "../../context/NavigationContext";
import ShoppingBagContainer from "./ShoppingBagContainer";
import IconLink from "./IconLink";
import Tooltip from "./Tooltip";
import SvgIcon from "./SvgIcon";
import tooltipVariants from "./tooltipVariants";
import createSvgVariants from "./createSvgVariants";

export default function ShoppingBagIcon() {
  const pathname = usePathname();
  const router = useRouter();
  const { $isNavigating, set$isNavigating, previousPath } = useNavigation();
  const isCurrentPage = pathname === "/Typefaces";
  const isTypefacesPage = pathname === "/Typefaces";
  const isIDPath = pathname === "/ID";

  // Fade in when navigating from ID or Typefaces to home
  const shouldFadeIn =
    (pathname === "/" &&
      (previousPath === "/ID" || previousPath === "/Typefaces")) ||
    ((previousPath === "/ID" || previousPath === "/Typefaces") &&
      $isNavigating);

  // Create dynamic SVG variants based on current page state
  const svgVariants = createSvgVariants(isTypefacesPage);

  // Handle click to trigger fade out and navigation
  const handleClick = (e) => {
    if (pathname === "/ID") {
      e.preventDefault();
      // Set navigating state to trigger fade transition
      set$isNavigating(true);
      // Dispatch custom event to trigger hamburger fade-in
      document.dispatchEvent(new CustomEvent("typeface-icon-click"));
      // Navigate after setting navigating state
      router.push("/Typefaces");
    } else {
      // For other paths, set navigating state and let Link handle navigation
      set$isNavigating(true);
    }
  };

  return (
    <ShoppingBagContainer
      $isTypefacesPage={isTypefacesPage}
      $isCurrentPage={isCurrentPage}
      $isIDPath={isIDPath}
      $shouldFadeIn={shouldFadeIn}
      $isNavigating={$isNavigating}
    >
      <Link href="/Typefaces" aria-label="Typefaces">
        <IconLink
          $isTypefacesPage={isTypefacesPage}
          onClick={handleClick}
          whileHover="hover"
          initial="initial"
        >
          <SvgIcon
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            $isCurrentPage={false}
            $isTypefacesPage={isTypefacesPage}
            variants={svgVariants}
          >
            {/* Square bag body */}
            <rect
              className="bag-body"
              x="5"
              y="8"
              width="14"
              height="13"
              stroke="currentColor"
              strokeWidth="2.1"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Handle */}
            <path
              className="bag-handle"
              d="M8,8 L8,6 C8,3.79086 9.79086,2 12,2 C14.2091,2 16,3.79086 16,6 L16,8"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </SvgIcon>
          <Tooltip
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            variants={tooltipVariants}
          >
            Typefaces
          </Tooltip>
        </IconLink>
      </Link>
    </ShoppingBagContainer>
  );
}

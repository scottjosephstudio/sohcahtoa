import { HamburgerIconWrapper, SvgIcon } from "../styles/HamburgerStyles";
import { createSvgVariants } from "../styles/animationVariants";

export default function HamburgerIcon({
  $isMenuOpen,
  isOnTypefaces,
  isClosingOnTypefaces,
}) {
  // Create dynamic SVG variants based on current state
  const svgVariants = createSvgVariants(
    $isMenuOpen,
    isOnTypefaces,
    isClosingOnTypefaces,
  );

  return (
    <HamburgerIconWrapper $isOpen={$isMenuOpen} $isOnTypefaces={isOnTypefaces}>
      <SvgIcon
        width="40"
        height="40"
        viewBox="0 0 17.96 17.95"
        variants={svgVariants}
        whileHover="hover"
        initial="initial"
        animate={$isMenuOpen ? "open" : "closed"}
      >
        <path
          fill="currentColor"
          d="M16.73,7.75h-6.53V1.23c0-.68-.55-1.23-1.22-1.23s-1.23.55-1.23,1.23v6.53H1.23c-.68,0-1.23.55-1.23,1.23s.55,1.23,1.23,1.23h6.53v6.53c0,.68.55,1.22,1.23,1.22s1.22-.55,1.22-1.22v-6.53h6.53c.68,0,1.22-.55,1.22-1.23s-.55-1.23-1.22-1.23Z"
          strokeWidth="0"
        />
      </SvgIcon>
    </HamburgerIconWrapper>
  );
}

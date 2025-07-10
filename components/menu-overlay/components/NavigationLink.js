import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

// Custom Link component with motion variants instead of CSS hover
const NavigationLink = ({ href, label, underline = false, onClick = null }) => {
  const pathname = usePathname();
  const isCurrentPage = pathname === href;

  if (isCurrentPage) {
    return (
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
          whiteSpace: "pre-line",
          WebkitTextSizeAdjust: "100%",
          MozTextSizeAdjust: "100%",
          msTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="hover"
      variants={{
        initial: {
          color: "white",
          textDecorationLine: underline ? "underline" : "none",
          textDecorationColor: "#39ff14",
          textDecorationThickness: underline ? "2px" : "0px",
          textUnderlineOffset: underline ? "3px" : "0px",
        },
        hover: {
          color: "white",
          textDecorationLine: "underline",
          textDecorationColor: "#39ff14",
          textDecorationThickness: "2px",
          textUnderlineOffset: "3px",
          transition: { duration: 0.2 },
        },
      }}
      style={{
        fontSize: "20px",
        lineHeight: "24px",
        letterSpacing: "0.6px",
        whiteSpace: "pre-line",
        WebkitTextSizeAdjust: "100%",
        MozTextSizeAdjust: "100%",
        msTextSizeAdjust: "100%",
        textSizeAdjust: "100%",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
    >
      <Link
        href={href}
        onClick={onClick}
        style={{
          color: "inherit",
          textDecoration: "inherit",
          textDecorationColor: "inherit",
          textDecorationThickness: "inherit",
          textUnderlineOffset: "inherit",
        }}
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default NavigationLink;

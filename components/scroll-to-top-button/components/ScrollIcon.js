import React from "react";
import { SvgIcon } from "../styles/StyledComponents";
import { svgVariants } from "../styles/animationVariants";

export const ScrollIcon = () => (
  <SvgIcon
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 62 62"
    variants={svgVariants}
    whileHover="hover"
    initial="initial"
  >
    {/* Circle outline */}
    <circle
      cx="31"
      cy="31"
      r="25"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
    />

    {/* Monoline arrow with rounded caps */}
    <path
      d="M31 21 L31 41"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M21 31 L31 21 L41 31"
      stroke="currentColor"
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </SvgIcon>
);

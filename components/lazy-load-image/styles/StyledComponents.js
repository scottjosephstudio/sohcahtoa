import styled from "styled-components";
import { motion } from "framer-motion";

export const ImageContainer = styled(motion.div)`
  position: relative;
  width: 100%;
  overflow: hidden;
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${({ $aspectRatio }) =>
    $aspectRatio || "75%"}; /* Default 4:3 ratio */
  overflow: hidden;
`;

export const StyledImage = styled(motion.img)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: opacity, filter, transform;
  visibility: ${({ $isLoaded }) => ($isLoaded ? "visible" : "hidden")};
`;

export const PlaceholderImage = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: transparent;
  will-change: opacity;
`;

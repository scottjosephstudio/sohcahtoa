"use client";

import { useRef } from "react";
import {
  ImageContainer,
  ImageWrapper,
  StyledImage,
  PlaceholderImage,
} from "./styles/StyledComponents";
import {
  containerVariants,
  imageVariants,
  placeholderVariants,
} from "./styles/animationVariants";
import { useIntersectionObserver } from "./hooks/useIntersectionObserver";
import { useImageLoader } from "./hooks/useImageLoader";
import { useAspectRatio } from "./hooks/useAspectRatio";
import {
  getImageAnimationState,
  getPlaceholderAnimationState,
} from "./utils/animationHelpers";
import { getActualPlaceholder } from "./utils/placeholderUtils";

const LazyLoadImage = ({
  src,
  alt,
  placeholderSrc,
  isSliding = false,
  aspectRatio,
  ...props
}) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Use custom hooks for functionality
  const isInView = useIntersectionObserver(containerRef);
  const { isLoaded, isBlurCleared } = useImageLoader(src, isInView);
  const imageAspectRatio = useAspectRatio(src, isInView, aspectRatio);

  // Use utility functions
  const actualPlaceholder = getActualPlaceholder(placeholderSrc);

  return (
    <ImageContainer
      ref={containerRef}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <ImageWrapper $aspectRatio={imageAspectRatio}>
        {isInView && (
          <>
            <PlaceholderImage
              animate={getPlaceholderAnimationState(isLoaded, isSliding)}
              variants={placeholderVariants}
              initial="visible"
            />
            <StyledImage
              ref={imageRef}
              src={src}
              alt={alt}
              $isLoaded={isLoaded}
              animate={getImageAnimationState(
                isSliding,
                isLoaded,
                isBlurCleared,
              )}
              variants={imageVariants}
              initial="hidden"
              loading="lazy"
              decoding="async"
              {...props}
            />
          </>
        )}
      </ImageWrapper>
    </ImageContainer>
  );
};

export default LazyLoadImage;

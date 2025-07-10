// LazyImage - Safari Optimized

import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: ${(props) => {
    if (props.$aspectRatio) {
      // Handle both decimal aspect ratios and percentage strings
      if (typeof props.$aspectRatio === "number") {
        // Convert decimal aspect ratio (width/height) to padding percentage
        return `${(1 / props.$aspectRatio) * 100}%`;
      } else if (typeof props.$aspectRatio === "string") {
        // If it's already a percentage string, use it directly
        return props.$aspectRatio;
      }
    }
    return "75%"; // Default 4:3 ratio
  }};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 12px 12px 12px rgba(16, 12, 8, 0.6);
  background-color: #666666;
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.4) 40%, transparent 40%),
    linear-gradient(rgba(255, 255, 255, 0.4) 40%, transparent 40%);
  background-size: 6px 6px;
  transition: opacity 0.3s ease;
  contain: layout paint;
  display: block;
`;

const ProjectImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition:
    filter 0.5s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  filter: ${(props) =>
    props.isloaded === "true" ? "blur(0px)" : "blur(10px)"};
  opacity: ${(props) => (props.isloaded === "true" ? 1 : 0)};
  user-select: none;
  pointer-events: none;

  /* Performance optimizations */
  will-change: ${(props) =>
    props.isloaded === "true" ? "auto" : "opacity, filter"};
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  transform: translateZ(0);

  /* Safari-specific optimizations */
  @supports (-webkit-touch-callout: none) {
    will-change: ${(props) =>
      props.isloaded === "true" ? "auto" : "opacity, filter"};
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
  }
`;

// Safari-optimized LazyImage component
const LazyImage = ({ src, alt, index, aspectRatio: propAspectRatio }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [calculatedAspectRatio, setCalculatedAspectRatio] = useState("75%"); // Default 4:3 ratio
  const imgRef = useRef(null);
  const preloadedImageRef = useRef(null);

  // Use prop aspectRatio if provided, otherwise calculate it
  const aspectRatio = propAspectRatio || calculatedAspectRatio;

  // Only calculate aspect ratio if not provided via props
  useEffect(() => {
    if (!propAspectRatio) {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) {
        const ratio = (img.naturalHeight / img.naturalWidth) * 100;
          setCalculatedAspectRatio(`${ratio}%`);
      }
    };
    img.src = src;
    }
  }, [src, propAspectRatio]);

  // Safari detection
  const isSafari = () => {
    if (typeof window === "undefined") return false;
    return (
      navigator.userAgent.includes("Safari") &&
      !navigator.userAgent.includes("Chrome")
    );
  };

  // Optimized image preloading with Safari-specific optimizations
  useEffect(() => {
    if (isInView && !isPreloaded) {
      // Create a new image for preloading
      const img = new Image();

      // Safari-specific optimizations
      if (isSafari()) {
        img.loading = "eager";
        img.decoding = "sync";
        // Safari benefits from immediate processing
      } else {
        img.loading = "eager";
        img.decoding = "async";
      }

      img.onload = () => {
        // Calculate actual aspect ratio from image dimensions only if not provided via props
        if (!propAspectRatio && img.naturalWidth && img.naturalHeight) {
          const ratio = (img.naturalHeight / img.naturalWidth) * 100;
          setCalculatedAspectRatio(`${ratio}%`);
        }

        setIsPreloaded(true);
        preloadedImageRef.current = img;

        // Safari-specific timing optimization
        if (isSafari()) {
          // Immediate for Safari to prevent layout shifts
          setIsLoaded(true);
        } else {
          // Use requestAnimationFrame for smoother performance with slight delay
          requestAnimationFrame(() => {
            setTimeout(() => {
              setIsLoaded(true);
            }, 100);
          });
        }
      };

      img.onerror = () => {
        setIsPreloaded(true);
        setIsLoaded(true);
      };

      // Start loading the image
      img.src = src;
    }
  }, [isInView, src, isPreloaded]);

  useEffect(() => {
    // Safari-optimized Intersection Observer
    const observerOptions = {
      rootMargin: isSafari() ? "100px" : "50px", // Larger margin for Safari
      threshold: isSafari() ? [0, 0.1] : 0.1,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
          setIsInView(true);
          // Disconnect observer immediately for performance
          if (observer) {
            observer.disconnect();
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    const initObserver = () => {
      if (imgRef.current && observer) {
        observer.observe(imgRef.current);
      }
    };

    // Initialize observer
    if (typeof window !== "undefined") {
      initObserver();
    }

    // Cleanup function
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  const handleImageLoad = (e) => {
    // Safari-optimized load handler
    if (!isLoaded) {
      const img = e.target;
      if (img.naturalWidth && img.naturalHeight) {
        setIsPreloaded(true);

        // Safari-specific timing
        if (isSafari()) {
          setIsLoaded(true);
        } else {
          // Use requestAnimationFrame for smoother performance with slight delay
          requestAnimationFrame(() => {
            setTimeout(() => {
              setIsLoaded(true);
            }, 100);
          });
        }
      }
    }
  };

  return (
    <ImageContainer ref={imgRef} $aspectRatio={aspectRatio}>
      {isInView && isPreloaded && (
        <ProjectImage
          src={src}
          alt={alt}
          isloaded={isLoaded.toString()}
          onLoad={handleImageLoad}
          decoding={isSafari() ? "sync" : "async"}
          loading="eager"
        />
      )}
    </ImageContainer>
  );
};

export default LazyImage;

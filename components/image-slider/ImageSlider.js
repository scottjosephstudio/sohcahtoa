"use client";

import React, { useEffect } from "react";
import { SliderContainer } from "./styles/SliderStyles";
import SliderImage from "./components/SliderImage";
import SliderCaption from "./components/SliderCaption";
import SliderControls from "./components/SliderControls";
import { useSliderState } from "./hooks/useSliderState";
import { useCaptionHeight } from "./hooks/useCaptionHeight";
import { getAspectRatioPercentage } from "./utils/aspectRatioUtils";
import { getImageSrc } from "../../lib/projectUtils";

/**
 * Preload all images in the slider for smooth transitions
 * @param {Array} images Array of image objects
 */
const preloadSliderImages = (images) => {
  if (!images || images.length === 0) return;

  images.forEach((image) => {
    const img = new Image();
    img.src = getImageSrc(image);
    // Preload but don't block rendering
    img.loading = "eager";
    img.decoding = "async";
  });
};

/**
 * Image slider component that displays a set of images with cursor-based navigation
 * and a numbered indicator instead of dots. Captions fade in and out between slides using Framer Motion.
 * @param {Object} props Component props
 * @param {Array} props.images Array of image objects with src and caption
 * @param {String} props.aspectRatio Aspect ratio for the images (e.g., '3/4', '16/9')
 * @param {Array} props.placeholders Array of placeholder image URLs
 * @param {String} props.title Project title for alt text
 */
const ImageSlider = ({ images, aspectRatio, placeholders, title }) => {
  // Don't render anything if there are no images
  if (!images || images.length === 0) {
    return null;
  }

  // Preload all images when component mounts
  useEffect(() => {
    preloadSliderImages(images);
  }, [images]);

  const {
    currentSlide,
    isTransitioning,
    showCaption,
    isMounted,
    hasMultipleImages,
    prevSlide,
    nextSlide,
  } = useSliderState(images);

  const captionHeight = useCaptionHeight(images, isMounted);
  const aspectRatioPercentage = getAspectRatioPercentage(aspectRatio);

  // If there's only one image, render it without navigation but still with number indicator
  if (!hasMultipleImages) {
    const image = images[0];
    return (
      <div>
        <SliderContainer>
          <SliderImage
            image={image}
            isTransitioning={false}
            aspectRatioPercentage={aspectRatioPercentage}
            placeholders={placeholders}
            currentSlide={0}
            title={title}
          />
        </SliderContainer>

        <SliderCaption
          captionHeight={captionHeight}
          isMounted={isMounted}
          showCaption={true}
          image={image}
          currentSlide={0}
          hasMultipleImages={false}
        />
      </div>
    );
  }

  return (
    <div>
      <SliderContainer $hasMultipleImages={hasMultipleImages}>
        <SliderImage
          image={images[currentSlide]}
          isTransitioning={isTransitioning}
          aspectRatioPercentage={aspectRatioPercentage}
          placeholders={placeholders}
          currentSlide={currentSlide}
          title={title}
        />

        <SliderControls
          hasMultipleImages={hasMultipleImages}
          onPrevSlide={prevSlide}
          onNextSlide={nextSlide}
        />
      </SliderContainer>

      <SliderCaption
        captionHeight={captionHeight}
        isMounted={isMounted}
        showCaption={showCaption}
        image={images[currentSlide]}
        currentSlide={currentSlide}
        hasMultipleImages={hasMultipleImages}
      />
    </div>
  );
};

export default ImageSlider;

import React from "react";
import LazyLoadImage from "../../lazy-load-image";
import { SlideImageContainer } from "../styles/SliderStyles";
import { getImageSrc, getImageCaption } from "../../../lib/projectUtils";

/**
 * Component for displaying a single slider image
 * @param {Object} props Component props
 * @param {Object} props.image Image object
 * @param {boolean} props.isTransitioning Whether image is transitioning
 * @param {string} props.aspectRatioPercentage Calculated aspect ratio
 * @param {Array} props.placeholders Array of placeholder images
 * @param {number} props.currentSlide Current slide index
 * @param {string} props.title Project title for alt text
 */
const SliderImage = ({
  image,
  isTransitioning,
  aspectRatioPercentage,
  placeholders,
  currentSlide,
  title,
}) => {
  return (
    <SlideImageContainer $isTransitioning={isTransitioning}>
      <LazyLoadImage
        src={getImageSrc(image)}
        alt={`${title} - ${getImageCaption(image, `Image ${currentSlide + 1}`)}`}
        placeholderSrc={placeholders ? placeholders[currentSlide] : null}
        isSliding={isTransitioning}
        aspectRatio={aspectRatioPercentage}
      />
    </SlideImageContainer>
  );
};

export default SliderImage;

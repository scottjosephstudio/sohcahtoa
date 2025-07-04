import React from "react";
import { AnimatePresence } from "framer-motion";
import {
  CaptionContainer,
  AnimatedCaptionWrapper,
  SlideCaption,
  NumberIndicator,
} from "../styles/SliderStyles";
import { captionVariants } from "../styles/animationVariants";
import { getImageCaption } from "../../../lib/projectUtils";

/**
 * Component for displaying slider caption with animations
 * @param {Object} props Component props
 * @param {string} props.captionHeight Fixed height for caption container
 * @param {boolean} props.isMounted Whether component is mounted
 * @param {boolean} props.showCaption Whether to show caption
 * @param {Object} props.image Current image object
 * @param {number} props.currentSlide Current slide index
 * @param {boolean} props.hasMultipleImages Whether slider has multiple images
 */
const SliderCaption = ({
  captionHeight,
  isMounted,
  showCaption,
  image,
  currentSlide,
  hasMultipleImages,
}) => {
  const slideNumber = hasMultipleImages ? currentSlide + 1 : 1;
  const caption = getImageCaption(
    image,
    hasMultipleImages ? `Image ${slideNumber}` : "Image",
  );

  return (
    <CaptionContainer $height={captionHeight}>
      {isMounted && (
        <AnimatePresence mode="wait">
          {showCaption && (
            <AnimatedCaptionWrapper
              key={`caption-${currentSlide}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={captionVariants}
            >
              <SlideCaption>{caption}</SlideCaption>
              <NumberIndicator>{slideNumber}</NumberIndicator>
            </AnimatedCaptionWrapper>
          )}
        </AnimatePresence>
      )}
    </CaptionContainer>
  );
};

export default SliderCaption;

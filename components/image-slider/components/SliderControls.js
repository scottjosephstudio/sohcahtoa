import React from 'react';
import { LeftClickArea, RightClickArea } from '../styles/SliderStyles';

/**
 * Component for slider navigation controls (invisible click areas)
 * @param {Object} props Component props
 * @param {boolean} props.hasMultipleImages Whether slider has multiple images
 * @param {Function} props.onPrevSlide Handler for previous slide
 * @param {Function} props.onNextSlide Handler for next slide
 */
const SliderControls = ({ hasMultipleImages, onPrevSlide, onNextSlide }) => {
  if (!hasMultipleImages) return null;

  return (
    <>
      <LeftClickArea 
        onClick={onPrevSlide} 
        $hasMultipleImages={hasMultipleImages} 
        aria-label="Previous slide"
      />
      <RightClickArea 
        onClick={onNextSlide} 
        $hasMultipleImages={hasMultipleImages} 
        aria-label="Next slide"
      />
    </>
  );
};

export default SliderControls; 
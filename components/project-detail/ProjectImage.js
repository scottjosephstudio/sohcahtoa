"use client";

import React from 'react';
import styled from 'styled-components';
import ImageSlider from '../image-slider';

const ImageItem = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

export default function ProjectImage({ 
  images, 
  aspectRatio, 
  placeholders, 
  title, 
  index = 0, 
  isExiting = false,
  className = ""
}) {
  // Return null if no images or empty array
  if (!images || !Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <ImageItem $index={index} $isExiting={isExiting}>
        <ImageSlider
          images={images}
          aspectRatio={aspectRatio}
          placeholders={placeholders || []}
          title={title}
        />
      </ImageItem>
    </div>
  );
} 
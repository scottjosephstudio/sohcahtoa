'use client';

import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

import useInfiniteBanner from '../../../../hooks/TypefaceSlotMachine/useInfiniteBanner';

// Create motion components from styled-components
const MotionBannerContainer = styled(motion.div)`
  position: fixed;
  width: 100%;
  bottom: env(safe-area-inset-bottom, 0);
  left: 0;
  right: 0;
  height: 45px;
  background-color: rgb(16, 12, 8);
  overflow: hidden;
  z-index: 10;
  cursor: default;

  @media (max-width: 768px) {
    bottom: env(safe-area-inset-bottom, 0);
  }
`;

const MotionBannerContent = styled(motion.div)`
  display: flex;
  white-space: nowrap;
  height: 100%;
  align-items: center;
  justify-content: center;
`;

const MotionBannerText = styled(motion.span)`
  display: inline-block;
  color: rgb(44, 255, 5);
  font-size: 18px;
  letter-spacing: 0.8px;
  font-weight: bold;
  padding-left: 12px;
  padding-right: 12px;

  &.arc-browser {
    margin-top: 6px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export default function InfiniteWidthBanner({
  bannerText = '// UNDER CONSTRUCTION //',
}) {
  const { containerRef, textRef, repetitions, controls } =
    useInfiniteBanner(bannerText);

  return (
    <MotionBannerContainer
      ref={containerRef}
      aria-label="Site status banner"
      initial={{ y: '100%' }}
      animate={{ y: '0%' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="banner-container" // Add the banner-container class
    >
      <MotionBannerContent animate={controls}>
        {[...Array(repetitions)].map((_, i) => (
          <MotionBannerText
            key={i}
            ref={i === 0 ? textRef : null}
            animate={{
              opacity: [1, 0.5, 1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
          >
            {bannerText}
          </MotionBannerText>
        ))}
      </MotionBannerContent>
    </MotionBannerContainer>
  );
}
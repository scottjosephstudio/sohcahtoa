"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const DescriptionTitle = styled.p`
  text-decoration: underline !important;
  text-decoration-color: #39ff14 !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px;
  font-size: 20px;
  line-height: 24px;
  letter-spacing: 0.8px;
  margin-bottom: 12px;
`;

const DescriptionItem = styled(motion.div)`
  margin-bottom: 12px;

  & p {
    margin: 0 0 12px 0;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.8px;
  }

  &:last-child p {
    margin-bottom: 0;
  }
`;

const TechnologiesContainer = styled(motion.div)`
  /* Simplified container without excessive hardware acceleration */
`;

const ProjectDescriptionContainer = styled(motion.div)`
  width: 100%;
  color: rgb(16, 12, 8);
  position: relative;
  text-align: left;
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  overflow: hidden;
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    background-repeat: repeat;
    opacity: 0.5;
    mix-blend-mode: multiply;
    z-index: 0;
    pointer-events: none;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
      border-radius: 10px;
    }
  
  .long-description {
    position: relative;
    z-index: 1;
  }

  .description-title {
    margin-bottom: 12px;
  }

  @media (min-width: 992px) and (max-width: 1580px) {
    position: sticky;
    top: 86px;
  }

  /* CSS columns for non-Safari browsers */
  @media (max-width: 600px) {
    .long-description:not(.safari-columns) {
    column-count: 1;
    column-gap: 0;
    }
  }

  @media (min-width: 601px) and (max-width: 1023px) {
    .long-description:not(.safari-columns) {
      column-count: 2;
      column-gap: 24px;
    }
  }

  @media (min-width: 1440px) {
    .long-description:not(.safari-columns) {
    column-count: 3;
    column-gap: 24px;
    }
  }

  /* Safari manual columns */
  .safari-columns {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }

  .safari-column {
    flex: 1;
  }

  .safari-column p:last-child {
    margin-bottom: 0;
  }

  .safari-column:last-child p:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 600px) {
    .safari-columns {
      flex-direction: column;
      gap: 0;
    }
  }

  /* Initial state - only Safari elements start invisible */
  & .safari-title,
  & .safari-columns p,
  & .safari-technologies {
    opacity: 0;
  }

  /* After initial animation, make all Safari elements visible by default */
  &.animation-complete .safari-title,
  &.animation-complete .safari-columns p,
  &.animation-complete .safari-technologies {
    opacity: 1;
    transform: translateY(0);
  }

  /* Safari-specific fade in - includes title, paragraphs, and technologies */
  &.fade-in:not(.animation-complete) .safari-title,
  &.fade-in:not(.animation-complete) .safari-columns p,
  &.fade-in:not(.animation-complete) .safari-technologies {
    animation: fadeInUp 0.6s ease-out forwards;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* DescriptionTitle styles */
  & > ${DescriptionTitle} {
    margin-bottom: 12px;
    font-size: 20px;
    letter-spacing: 0.8px;
    position: relative;
    z-index: 1;
  }

  /* Paragraph styles */
  & .long-description p {
    position: relative;
    z-index: 1;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    color: rgb(16, 12, 8) !important;
    margin-bottom: 12px;
  }

  p.production-credit {
    padding-left: 20px;
    padding-right: 20px;
    font-size: 20px;
    line-height: 24px;
    letter-spacing: 0.8px;
    color: rgba(16, 12, 8) !important;
    position: relative;
    z-index: 1;
    margin-bottom: 12px;
  }

  .small-caps {
    font-variant: small-caps;
  }

  /* Technologies section styles */
  & .technologies {
    margin-top: 20px;
    position: relative;
    z-index: 1;
  }

  /* Safari-specific technologies spacing fix */
  & .safari-technologies {
    margin-top: 20px !important;
  }

  .technology-tag {
    background: #f3f4f6;
    padding: 6px 12px;
    border-radius: 30px;
    font-size: 12px;
    letter-spacing: 0.8px;
    color: rgb(16, 12, 8) !important;
    margin: 4px;
    display: inline-block;
  }

  /* Style for email links within paragraphs - matching title formatting */
  & .content p a {
    color: rgb(16, 12, 8) !important;
    text-decoration: underline !important;
    text-decoration-color: #39ff14 !important;
    text-decoration-thickness: 2px !important;
    text-underline-offset: 3px !important;
    font-size: 20px;
    letter-spacing: 0.8px;
    line-height: 24px;
    transition: all 0.2s ease;
  }

  & .content p a:hover {
    color: #39ff14 !important;
    text-decoration-color: rgb(16, 12, 8) !important;
  }
`;

export default function ProjectDescription({ 
  project, 
  processedLongDescription, 
  isVisible, 
  isExiting, 
  isSafari, 
  containerVariants, 
  itemVariants 
}) {
  const [animationReady, setAnimationReady] = useState(false);
  const [hasCompletedInitialAnimation, setHasCompletedInitialAnimation] = useState(false);

  // Delay to ensure layout is stable before triggering CSS animations
  useEffect(() => {
    if (isVisible) {
      const stabilityTimeout = setTimeout(() => {
        setAnimationReady(true);
        // Mark that initial animation has started
        setTimeout(() => {
          setHasCompletedInitialAnimation(true);
        }, 1000); // After animation completes (600ms + buffer)
      }, 150);

      return () => clearTimeout(stabilityTimeout);
    } else {
      setAnimationReady(false);
    }
  }, [isVisible, project.id]);

  // Reset animation states when project changes
  useEffect(() => {
    setHasCompletedInitialAnimation(false);
    setAnimationReady(false);
  }, [project.id]);



  // Helper function to get column count based on screen width
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1440) return 3;
    if (width >= 601 && width <= 1023) return 2;
    return 1;
  };

  // Split content into columns for Safari
  const splitIntoColumns = (content, columnCount) => {
    if (columnCount === 1) return [content];
    
    const columns = Array.from({ length: columnCount }, () => []);
    content.forEach((item, index) => {
      columns[index % columnCount].push(item);
    });
    return columns;
  };

  const [columnCount, setColumnCount] = useState(1);

  // Update column count on window resize (responsive behavior without re-animation)
  useEffect(() => {
    const updateColumnCount = () => {
      const newColumnCount = getColumnCount();
      if (newColumnCount !== columnCount) {
        setColumnCount(newColumnCount);
      }
    };
    
    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, [columnCount]);

  const safariColumns = isSafari ? splitIntoColumns(processedLongDescription, columnCount) : [];

  return (
    <div className="description">
      <AnimatePresence mode="wait">
        <ProjectDescriptionContainer
          key={project.id}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          exit="exit"
          variants={containerVariants}
          className={
            isSafari && animationReady 
              ? hasCompletedInitialAnimation 
                ? 'fade-in animation-complete' 
                : 'fade-in'
              : ''
          }
        >
          {isSafari ? (
            // Safari-specific manual column layout
            <div>
              <DescriptionTitle className="safari-title">{project.title}</DescriptionTitle>
              <div className="long-description safari-columns">
                {safariColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="safari-column">
                    {column.map((paragraph, paragraphIndex) => (
                      <p 
                        key={paragraphIndex}
                        className={paragraph.isProductionCredit ? "production-credit" : ""}
                        dangerouslySetInnerHTML={{ __html: paragraph.text }}
                      />
                    ))}
                  </div>
                ))}
              </div>
              {project.technologies && (
                <div className="technologies safari-technologies">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="technology-tag">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Non-Safari with Framer Motion staggered animations
            <div>
              <DescriptionItem variants={itemVariants} $isExiting={isExiting}>
                <DescriptionTitle>{project.title}</DescriptionTitle>
              </DescriptionItem>
              
              <motion.div 
                className="long-description"
                initial="hidden"
                animate={animationReady ? "visible" : "hidden"}
                exit="exit"
                variants={containerVariants}
              >
                {processedLongDescription.map((paragraph, index) => (
                  <DescriptionItem 
                    key={index} 
                    variants={itemVariants} 
                    $isExiting={isExiting}
                  >
                    <p 
                      className={paragraph.isProductionCredit ? "production-credit" : ""}
                      dangerouslySetInnerHTML={{ __html: paragraph.text }}
                    />
                  </DescriptionItem>
                ))}
              </motion.div>
          
          {project.technologies && (
            <TechnologiesContainer variants={itemVariants} $isExiting={isExiting}>
              <div className="technologies">
                {project.technologies.map((tech, index) => (
                  <span key={index} className="technology-tag">{tech}</span>
                ))}
              </div>
            </TechnologiesContainer>
              )}
            </div>
          )}
        </ProjectDescriptionContainer>
      </AnimatePresence>
    </div>
  );
}
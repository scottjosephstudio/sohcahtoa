'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TransitionWrapper from '../../components/providers/TransitionWrapper';
import { CookiesPanelProvider } from '../../components/cookies-panel';
import CookiesPanel from '../../components/cookies-panel';
import imageData from '../../data/indeximageData';
import LazyImage from '../../components/homepage/LazyImage';
import LoadMoreButton from '../../components/homepage/LoadMoreButton';
import {
  HomeContainer,
  ProjectsGrid,
  ProjectTile,
  ProjectCaption,
  itemVariants
} from '../../components/homepage/StyledComponents';

export default function HomePage() {
  const [visibleImages, setVisibleImages] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [transitionComplete, setTransitionComplete] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadMoreButton, setShowLoadMoreButton] = useState(false);
  const [columnsPerRow, setColumnsPerRow] = useState(4);
  const [isClient, setIsClient] = useState(false);
  const gridRef = useRef(null);
  const targetProjectId = 'TheBeginningofForms';
  
  // Calculate columns based on screen width
  const calculateColumnsPerRow = () => {
    if (typeof window === 'undefined') return 4;
    const width = window.innerWidth;
    if (width < 600) return 1;
    if (width < 900) return 2;
    if (width < 1200) return 3;
    if (width < 1440) return 4;
    return 6;
  };
  
  // Number of images to load initially and on "load more"
  const getInitialCount = () => columnsPerRow * 3; // 3 full rows
  const getLoadMoreCount = () => columnsPerRow * 2; // 2 full rows per load
  
  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Update columns on resize (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    const handleResize = () => {
      const newColumnsPerRow = calculateColumnsPerRow();
      if (newColumnsPerRow !== columnsPerRow) {
        setColumnsPerRow(newColumnsPerRow);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [columnsPerRow, isClient]);
  
  // Shuffle images when component mounts or columns change (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    const shuffleArray = (array) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    
    // Add unique IDs to each image to help track duplicates
    const imagesWithIds = imageData.map((img, index) => ({
      ...img,
      originalIndex: index,
      id: `img-${index}` // Add a unique identifier
    }));
    
    const shuffled = shuffleArray(imagesWithIds);
    setShuffledImages(shuffled);
    
    // Ensure initial image count is always a multiple of columns for complete rows
    const initialCount = getInitialCount();
    const adjustedInitialCount = Math.floor(initialCount / columnsPerRow) * columnsPerRow;
    
    // Ensure we show at least one complete row, even if fewer images are requested
    const finalInitialCount = Math.max(adjustedInitialCount, columnsPerRow);
    const initialImages = shuffled.slice(0, Math.min(finalInitialCount, shuffled.length));
        
    // Set visible images immediately - no loading delay!
    setVisibleImages(initialImages);
    setHasMore(shuffled.length > initialImages.length);
    
    // Safari-specific preloading for first few images
    if (typeof window !== 'undefined') {
      const isSafari = navigator.userAgent.includes('Safari') && 
        !navigator.userAgent.includes('Chrome');
      
      if (isSafari) {
        initialImages.slice(0, 6).forEach((img) => {
          const preloadImg = new Image();
          preloadImg.loading = 'eager';
          preloadImg.src = img.src;
        });
      }
    }
  }, [columnsPerRow, isClient]);
  
  // Show load more button after transition completes
  useEffect(() => {
    if (transitionComplete && visibleImages.length > 0) {
      const timer = setTimeout(() => {
        setShowLoadMoreButton(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [transitionComplete, visibleImages.length]);
  
  return (
    <CookiesPanelProvider testMode={false} forceShow={false}>
      <TransitionWrapper onTransitionComplete={() => setTransitionComplete(true)}>
        <HomeContainer>
          <ProjectsGrid
                ref={gridRef}
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${columnsPerRow}, 1fr)`,
                  gap: 20,
                  maxWidth: '100%',
                  padding: 0
                }}
              >
                {visibleImages.length > 0 ? (
                  visibleImages.map((image, index) => (
                    <motion.div key={image.id} variants={itemVariants}>
                      <ProjectTile href={`/Projects/${targetProjectId}`}>
                      <LazyImage 
                        src={image.src} 
                        alt={image.caption || 'Project image'} 
                        index={index}
                        aspectRatio={image.aspectRatio}
                      />
                      <ProjectCaption className="caption">{image.caption || 'Untitled'}</ProjectCaption>
                    </ProjectTile>
                    </motion.div>
                  ))
                ) : (
                  <p></p>
                )}
          </ProjectsGrid>
              
                  <LoadMoreButton 
                isLoading={isLoading}
                hasMore={hasMore}
                showLoadMoreButton={showLoadMoreButton}
                visibleImages={visibleImages}
                shuffledImages={shuffledImages}
                setVisibleImages={setVisibleImages}
                setHasMore={setHasMore}
                setIsLoading={setIsLoading}
                columnsPerRow={columnsPerRow}
            getLoadMoreCount={getLoadMoreCount}
              />
        </HomeContainer>
      </TransitionWrapper>
      
      <CookiesPanel 
        testMode={false} 
        showDebug={process.env.NODE_ENV === 'development'} 
      />
    </CookiesPanelProvider>
  );
}

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TypefaceTabContainer, 
  TypefaceTab, 
  TypefaceSlider,
  typefaceTabVariants
} from './TypefaceStyledComponents';

const tabContainerVariants = {
  initial: {
    y: -100,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.6, -0.05, 0.01, 0.99]
    }
  },
  exit: {
    y: -100,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1]
    }
  }
};

const TypefaceHeaderTabs = ({
  activeTab,
  onTabChange,
  isNavigatingHome
}) => {
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0, top: 0 });
  const tabRefs = useRef([]);
  const containerRef = useRef(null);
  const tabs = ['Specimen', 'Test', 'Glyphs'];

  const updateSliderPosition = (index) => {
    if (tabRefs.current[index] && containerRef.current) {
      const tab = tabRefs.current[index];
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const tabRect = tab.getBoundingClientRect();
      const isMobile = window.innerWidth <= 600;

      if (isMobile) {
        setSliderStyle({
          top: tabRect.top - containerRect.top,
          left: 0,
          width: '100%'
        });
      } else {
        setSliderStyle({
          left: tabRect.left - containerRect.left,
          width: tabRect.width,
          top: 0
        });
      }
    }
  };

  useEffect(() => {
    updateSliderPosition(['specimen', 'test', 'glyphs'].indexOf(activeTab));

    const handleResize = () => {
      updateSliderPosition(['specimen', 'test', 'glyphs'].indexOf(activeTab));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  const handleTabClick = (tab, index) => {
    onTabChange(tab.toLowerCase());
    updateSliderPosition(index);
  };

  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && (
        <TypefaceTabContainer 
          ref={containerRef}
          as={motion.div}
          variants={tabContainerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
        <TypefaceSlider
  animate={sliderStyle}
  transition={{ duration: 0.1, ease: "easeInOut" }}
  initial={false}
  style={{ transition: 'transform 0.1s ease-in-out' }}
/>
          {tabs.map((tab, index) => (
            <TypefaceTab
              key={tab}
              $isActive={activeTab === tab.toLowerCase()}
              onClick={() => handleTabClick(tab, index)}
              ref={el => (tabRefs.current[index] = el)}
              variants={typefaceTabVariants}
              whileHover="hover"
              custom={{ $isActive: activeTab === tab.toLowerCase() }}
            >
              <span>{tab}</span>
            </TypefaceTab>
          ))}
        </TypefaceTabContainer>
      )}
    </AnimatePresence>
  );
};

export default TypefaceHeaderTabs;
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavigation } from '../../context/NavigationContext';
import { usePathname } from 'next/navigation';
import menuData from '../../data/menuData';
import { useEffect, useState } from 'react';
import NavigationContainer from './NavigationContainer';
import NavigationButton from './NavigationButton';
import NavigationButtonStatic from './NavigationButtonStatic';
import PrevTooltip from './PrevTooltip';
import NextTooltip from './NextTooltip';
import SvgIcon from './SvgIcon';
import tooltipVariants from './tooltipVariants';
import createSvgVariants from './createSvgVariants';

export default function NavigationArrows({ 
  // Allow overriding props when used in TypefaceFooter
  customIsSpecialPage, 
  customAnimatedSlide,
  customIsTypefacesPage,
  customPrevLink,
  customNextLink,
  onPrevClick,
  onNextClick,
  forceShowOnIDPath = false
}) {
  const { $isNavigating } = useNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const [animatedSlide, setAnimatedSlide] = useState(false);
  const [prefetchedLinks, setPrefetchedLinks] = useState([]);
  
  // Check if we're on a special page (Terms or Typefaces)
  const isSpecialPage = customIsSpecialPage !== undefined ? customIsSpecialPage : (pathname === '/TermsAndConditions' || pathname === '/Typefaces');
  const isTypefacesPage = customIsTypefacesPage !== undefined ? customIsTypefacesPage : (pathname === '/Typefaces');
  const isIDPath = pathname === '/ID';
  
  // Create dynamic SVG variants based on current page state
  const svgVariants = createSvgVariants(isTypefacesPage);
  
  useEffect(() => {
    // Trigger animation for special pages after a delay
    if (isSpecialPage && customAnimatedSlide === undefined) {
      const timer = setTimeout(() => {
        setAnimatedSlide(true);
      }, 500); // 500ms delay before animation starts
      
      return () => clearTimeout(timer);
    } else if (customAnimatedSlide !== undefined) {
      // Use the provided animation state if available
      setAnimatedSlide(customAnimatedSlide);
    } else {
      // Reset animation state when not on special page
      setAnimatedSlide(false);
    }
  }, [isSpecialPage, customAnimatedSlide]);
  
  // Get all projects as a flat array
  const allProjects = menuData.sections.flatMap(section => 
    section.items.map(item => ({
      ...item,
      category: section.title
    }))
  );
  
  // Get current project ID from path
  const currentPathSegments = pathname?.split('/') || [];
  const currentId = currentPathSegments[currentPathSegments.length - 1];
  
  // Find current project index (handle animation project separately)
  const currentIndex = pathname?.includes('/Projects/Particle_Cloud')
    ? allProjects.findIndex(p => p.link.includes('Particle_Cloud')) 
    : allProjects.findIndex(p => {
        const projectId = p.link.split('/').pop();
        return currentId === projectId || 
               currentId === projectId.replace(/&/g, 'And');
      });
  
  // Function to safely format URLs
  const getSafeUrl = (url) => {
    return url?.replace(/&/g, 'And') || '';
  };
  
  // Get previous project ID
  const prevProjectId = currentIndex > 0 
    ? getSafeUrl(allProjects[currentIndex - 1].link.split('/').pop())
    : getSafeUrl(allProjects[allProjects.length - 1].link.split('/').pop()); // Loop to last project
  
  // Get next project ID
  const nextProjectId = currentIndex < allProjects.length - 1 
    ? getSafeUrl(allProjects[currentIndex + 1].link.split('/').pop())
    : getSafeUrl(allProjects[0].link.split('/').pop()); // Loop to first project
  
  // Only show navigation arrows on project pages or special pages
  const $ShouldShow = (pathname.includes('/Projects/') && pathname.split('/').length > 2) || isSpecialPage;
  
  // Prefetch adjacent project data to eliminate loading delays
  useEffect(() => {
    if (!$ShouldShow || isSpecialPage) return;
    
    // Create an array of links to prefetch (prev, next, and a few more in each direction)
    const linksToPrefetch = [];
    
    // Add previous links
    for (let i = 1; i <= 2; i++) {
      const prevIndex = (currentIndex - i + allProjects.length) % allProjects.length;
      const prevId = getSafeUrl(allProjects[prevIndex].link.split('/').pop());
      linksToPrefetch.push(`/Projects/${prevId}`);
    }
    
    // Add next links
    for (let i = 1; i <= 2; i++) {
      const nextIndex = (currentIndex + i) % allProjects.length;
      const nextId = getSafeUrl(allProjects[nextIndex].link.split('/').pop());
      linksToPrefetch.push(`/Projects/${nextId}`);
    }
    
    // Remove any duplicates and already prefetched links
    const newLinksToPrefetch = linksToPrefetch.filter(link => 
      !prefetchedLinks.includes(link)
    );
    
    // Perform the prefetching
    if (newLinksToPrefetch.length > 0) {
      newLinksToPrefetch.forEach(link => {
        router.prefetch(link);
      });
      
      // Update the list of prefetched links
      setPrefetchedLinks(prev => [...prev, ...newLinksToPrefetch]);
    }
  }, [pathname, currentIndex, $ShouldShow, isSpecialPage, router, prefetchedLinks]);

  // Handle custom click events
  const handlePrevClick = (e) => {
    if (onPrevClick) {
      e.preventDefault();
      onPrevClick(e);
    }
  };

  const handleNextClick = (e) => {
    if (onNextClick) {
      e.preventDefault();
      onNextClick(e);
    }
  };

  // For special pages, render static arrows (not links)
  if (isSpecialPage) {
    return (
      <NavigationContainer 
        $isNavigating={$isNavigating} 
        $ShouldShow={$ShouldShow} 
        $isSpecialPage={isSpecialPage}
        $animatedSlide={customAnimatedSlide !== undefined ? customAnimatedSlide : animatedSlide}
        $isTypefacesPage={isTypefacesPage}
        $isIDPath={isIDPath}
        $forceShowOnIDPath={forceShowOnIDPath}
        data-force-show={forceShowOnIDPath ? "true" : "false"}
        data-component="nav-arrows"
        // Only use framer-motion animations on Typefaces page, otherwise let CSS handle transitions
        {...(isTypefacesPage ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: {
            opacity: 0,
            transition: {
              duration: 0.8,
              ease: [0.25, 0.1, 0.25, 1]
            }
          },
          transition: {
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1]
          }
        } : {})}
      >
        <NavigationButtonStatic
          whileHover="hover"
          initial="initial"
        >
          <PrevTooltip 
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            variants={tooltipVariants}
          >
            Previous
          </PrevTooltip>
          <SvgIcon 
            viewBox="0 0 25 25" 
            $isTypefacesPage={isTypefacesPage}
            variants={svgVariants}
            whileHover="hover"
            initial="initial"
          >
            <path fill="currentColor" d="M4.18,12.26l5.27,5.27c.44.44,1.15.44,1.59,0s.44-1.15,0-1.59l-3.35-3.35h10.79c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12H7.69l3.35-3.35c.44-.44.44-1.15,0-1.59-.22-.22-.51-.33-.8-.33s-.58.11-.8.33l-5.27,5.27c-.44.44-.44,1.15,0,1.59Z" />
          </SvgIcon>
        </NavigationButtonStatic>
        
        <NavigationButtonStatic
          whileHover="hover"
          initial="initial"
        >
          <NextTooltip 
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            variants={tooltipVariants}
          >
            Next
          </NextTooltip>
          <SvgIcon 
            viewBox="0 0 25 25" 
            $isTypefacesPage={isTypefacesPage}
            variants={svgVariants}
            whileHover="hover"
            initial="initial"
          >
            <g transform="rotate(180 12.1 11.4)">
              <path fill="currentColor" d="M4.18,12.26l5.27,5.27c.44.44,1.15.44,1.59,0s.44-1.15,0-1.59l-3.35-3.35h10.79c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12H7.69l3.35-3.35c.44-.44.44-1.15,0-1.59-.22-.22-.51-.33-.8-.33s-.58.11-.8.33l-5.27,5.27c-.44.44-.44,1.15,0,1.59Z" />
            </g>
          </SvgIcon>
        </NavigationButtonStatic>
      </NavigationContainer>
    );
  }

  // Determine the actual link URLs to use (custom or calculated)
  const prevLink = customPrevLink || `/Projects/${prevProjectId}`;
  const nextLink = customNextLink || `/Projects/${nextProjectId}`;

  // For project pages, render normal navigation
  return (
    <NavigationContainer 
      $isNavigating={$isNavigating} 
      $ShouldShow={$ShouldShow}
      $isTypefacesPage={isTypefacesPage}
      $isIDPath={isIDPath}
      $forceShowOnIDPath={forceShowOnIDPath}
      data-force-show={forceShowOnIDPath ? "true" : "false"}
      data-component="nav-arrows"
      // Only use framer-motion animations on Typefaces page, otherwise let CSS handle transitions
      {...(isTypefacesPage ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: {
          opacity: 0,
          transition: {
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1]
          }
        },
        transition: {
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1]
        }
      } : {})}
    >
      <Link href={prevLink} aria-label="Previous Project">
        <NavigationButton 
          $isTypefacesPage={isTypefacesPage}
          onClick={handlePrevClick}
          whileHover="hover"
          initial="initial"
        >
          <PrevTooltip 
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            variants={tooltipVariants}
          >
            Previous Project
          </PrevTooltip>
          <SvgIcon 
            viewBox="0 0 25 25" 
            $isTypefacesPage={isTypefacesPage}
            variants={svgVariants}
            whileHover="hover"
            initial="initial"
          >
            <path fill="currentColor" d="M4.18,12.26l5.27,5.27c.44.44,1.15.44,1.59,0s.44-1.15,0-1.59l-3.35-3.35h10.79c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12H7.69l3.35-3.35c.44-.44.44-1.15,0-1.59-.22-.22-.51-.33-.8-.33s-.58.11-.8.33l-5.27,5.27c-.44.44-.44,1.15,0,1.59Z" />
          </SvgIcon>
        </NavigationButton>
      </Link>
      
      <Link href={nextLink} aria-label="Next Project">
        <NavigationButton 
          $isTypefacesPage={isTypefacesPage}
          onClick={handleNextClick}
          whileHover="hover"
          initial="initial"
        >
          <NextTooltip 
            className="tooltip"
            $isTypefacesPage={isTypefacesPage}
            variants={tooltipVariants}
          >
            Next Project
          </NextTooltip>
          <SvgIcon 
            viewBox="0 0 25 25" 
            $isTypefacesPage={isTypefacesPage}
            variants={svgVariants}
            whileHover="hover"
            initial="initial"
          >
            <g transform="rotate(180 12.1 11.4)">
              <path fill="currentColor" d="M4.18,12.26l5.27,5.27c.44.44,1.15.44,1.59,0s.44-1.15,0-1.59l-3.35-3.35h10.79c.62,0,1.12-.5,1.12-1.12s-.5-1.12-1.12-1.12H7.69l3.35-3.35c.44-.44.44-1.15,0-1.59-.22-.22-.51-.33-.8-.33s-.58.11-.8.33l-5.27,5.27c-.44.44-.44,1.15,0,1.59Z" />
            </g>
          </SvgIcon>
        </NavigationButton>
      </Link>
    </NavigationContainer>
  );
} 
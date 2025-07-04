'use client';

import Link from 'next/link';
import { useNavigation } from '../../context/NavigationContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import HomeIconContainer from './HomeIconContainer';
import IconLink from './IconLink';
import Tooltip from './Tooltip';
import SvgIcon from './SvgIcon';
import tooltipVariants from './tooltipVariants';
import createSvgVariants from './createSvgVariants';

export default function HomeIcon({ 
  onClick, 
  forceShow = false, 
  customPosition = null,
  customIsTypefacesPath = undefined
}) {
  const { $isNavigating, set$isNavigating, previousPath } = useNavigation();
  const pathname = usePathname();
  const [animatedSlide, setAnimatedSlide] = useState(false);
  const [isTypefacesFadingOut, setIsTypefacesFadingOut] = useState(false);
  const [arrowAnimationComplete, setArrowAnimationComplete] = useState(false);
  const router = useRouter();
  
  // Check if we're on a special page (terms or typefaces)
  const isSpecialPage = pathname === '/TermsAndConditions' || pathname === '/Typefaces';
  const isTypefacesPage = customIsTypefacesPath !== undefined ? customIsTypefacesPath : (pathname === '/Typefaces');
  const isIDPath = pathname === '/ID';
  
  // Only hide during specific transitions: Typefaces → ID (same logic as hamburger)
  const shouldHideForTransition = 
    (pathname === '/Typefaces' && $isNavigating) || // Hide when navigating FROM Typefaces
    (previousPath === '/Typefaces' && pathname === '/ID'); // Hide when arriving at ID from Typefaces
  
  useEffect(() => {
    // Trigger animation for special pages after a delay
    if (isSpecialPage) {
      const timer = setTimeout(() => {
        setAnimatedSlide(true);
      }, 500); // 500ms delay to follow the arrow animation
      
      // Set arrow animation complete state after navigation arrows finish
      const arrowTimer = setTimeout(() => {
        setArrowAnimationComplete(true);
      }, 800); // Additional delay to ensure navigation arrows animation is fully complete
      
      return () => {
        clearTimeout(timer);
        clearTimeout(arrowTimer);
      };
    } else {
      // Reset animation state when not on special page
      setAnimatedSlide(false);
      setArrowAnimationComplete(false);
    }
  }, [isSpecialPage]);
  
  // Only show home icon when not on the homepage
  const $ShouldShow = pathname !== '/';
  
  // Create dynamic SVG variants based on current page state
  const svgVariants = createSvgVariants(isTypefacesPage, isIDPath);
  
  // Enhanced click handler with proper transition timing and iOS scroll fix
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(e);
    } else {
      // If on Typefaces page, trigger slot machine exit animation and fade out
      if (isTypefacesPage) {
        // Prevent default to handle custom animation
        e.preventDefault();
        
        // Trigger fade-out effect for typefaces path
        setIsTypefacesFadingOut(true);
        
        // Coordinate all exit animations
        gsap.to('.slot-machine-page', {
          x: '0vw',
          scale: 0,
          duration: 0.25,
          ease: 'power3.in'
        });

        gsap.to('.banner-container', {
          y: '100%',
          duration: 0.3,
          ease: 'power3.in'
        });

        // Fade out login button and spinner
        gsap.to('.typefaces-container header', {
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in'
        });

        // Trigger spinner exit animation via custom event
        const spinnerExitEvent = new CustomEvent('spinnerExit');
        document.dispatchEvent(spinnerExitEvent);
        
        // Delay setting navigation state until after GSAP animations complete
        setTimeout(() => {
          // Now trigger navigation state for fade out transition
          set$isNavigating(true);
        }, 300); // After the GSAP animations finish
        
        // Wait for the transition wrapper fade out to complete, then navigate
        setTimeout(() => {
          router.push('/');
          
          // Ensure scroll to top on iOS after navigation
          // Additional timeout to ensure DOM has updated after navigation
          setTimeout(() => {
            // Multiple approaches to ensure scroll works on iOS
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // iOS Safari specific fix
            if (window.webkit && window.webkit.messageHandlers) {
              window.scrollTo(0, 0);
            }
            
            // Additional iOS fix using requestAnimationFrame
            requestAnimationFrame(() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
            });
            
            // Reset navigation state after scroll is handled
            set$isNavigating(false);
          }, 100);
        }, 500); // Match your transition wrapper timing
      }
      // For non-Typefaces pages, let the Link handle navigation normally (don't prevent default)
    }
  };
  
  // If a custom position is provided, use that instead of the defaults
  const style = customPosition ? { left: customPosition, position: 'fixed' } : {};
  
  return (
    <HomeIconContainer
      $isNavigating={$isNavigating}
      $shouldHideForTransition={shouldHideForTransition}
      $ShouldShow={$ShouldShow}
      $isSpecialPage={isSpecialPage}
      $animatedSlide={animatedSlide}
      $isTypefacesPage={isTypefacesPage}
      $isIDPath={isIDPath}
      $forceShow={forceShow}
      $arrowAnimationComplete={arrowAnimationComplete}
      style={style}
      data-component="home-icon"
      // Only use framer-motion animations on Typefaces page, otherwise let CSS handle transitions
      {...(isTypefacesPage ? {
        initial: { opacity: 0 },
        animate: { 
          opacity: (isTypefacesFadingOut || shouldHideForTransition) ? 0 : 1 
        },
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
      <Link href="/" aria-label="Home">
      <IconLink 
        $isTypefacesPage={isTypefacesPage}
        $isIDPath={isIDPath}
        onClick={handleClick}
          whileHover="hover"
          initial="initial"
      >
        <Tooltip 
          className="tooltip"
          $isTypefacesPage={isTypefacesPage}
          $isIDPath={isIDPath}
            variants={tooltipVariants}
        >
          Home
        </Tooltip>
        <SvgIcon 
          viewBox="0 0 25 25"
          $isTypefacesPage={isTypefacesPage}
          $isIDPath={isIDPath}
          $invert={false}
          variants={svgVariants}
          whileHover="hover"
          initial="initial"
        >
          <path fill="currentColor" d="M22.06,8.21L12.95,3.72c-.11-.05-.23-.09-.35-.1-.19-.02-.38.01-.55.1L2.94,8.21c-.34.17-.56.52-.56.9v11.27c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-4.23h2.02v4.23c0,.55.45,1,1,1h7.11c.55,0,1-.45,1-1v-11.27c0-.38-.22-.73-.56-.9ZM10.19,13.9c-.55,0-1,.45-1,1v4.23h-4.51v-9.26l7.82-3.85,7.82,3.85v9.26h-4.51v-4.23c0-.55-.45-1-1-1h-4.62Z" />
        </SvgIcon>
      </IconLink>
      </Link>
    </HomeIconContainer>
  );
} 
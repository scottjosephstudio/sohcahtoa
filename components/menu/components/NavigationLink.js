'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNavigation } from '../../../context/NavigationContext';

// Custom Link component with motion variants instead of CSS hover
export default function NavigationLink({ href, label, underline = false, onClick = null }) {
  const pathname = usePathname();
  const { set$isNavigating } = useNavigation();
  const router = useRouter();
  const isCurrentPage = pathname === href;

  // Add line breaks for specific titles
  const formattedLabel = label === 'Like A Tongue That Tried To Speak' 
    ? 'Like A Tongue That\nTried To Speak'
    : label === 'Speech Flies Away, Written Words Remain'
    ? 'Speech Flies Away,\nWritten Words Remain'
    : label;

  const handleClick = (e) => {
    // Set navigation state to trigger any exit animations
    set$isNavigating(true);
    
    // If we're on typefaces page, trigger exit animations first
    if (pathname === '/Typefaces') {
      e.preventDefault(); // Only prevent default on typefaces page
      
      // Import GSAP dynamically and trigger animations
      import('gsap').then(({ gsap }) => {
        // Animate the spinner with scale and fade out
        gsap.to('.spinner-container', {
          scale: 0,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
        });

        // Animate the slot machine with scale and fade out
        gsap.to('.slot-machine-page', {
          scale: 0,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.inOut',
          transformOrigin: 'center center',
        });

        // Animate banner with slight delay
        gsap.to('.banner-container', {
          y: '100%',
          duration: 0.6,
          delay: 0.2,
          ease: 'power3.in',
          onComplete: () => {
            // Navigate after animations complete
            router.push(href);
          },
        });

        // Fade out login button
        gsap.to('.typefaces-container header', {
          opacity: 0,
          duration: 0.3,
          ease: 'power3.in'
        });
      });
    }
    // For other pages, let Next.js Link handle navigation normally
    
    // Call any additional click handler
    if (onClick) {
      onClick(e);
    }
  };

  if (isCurrentPage) {
    return (
      <span 
        style={{ 
          color: 'white', 
          cursor: 'default',
          fontSize: '20px',
          lineHeight: '24px',
          letterSpacing: '0.6px',
          textDecoration: 'underline',
          textDecorationColor: '#39ff14',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
          transition: 'color 0.3s ease',
          whiteSpace: 'pre-line',
          WebkitTapHighlightColor: 'transparent'
        }}
      >
        {formattedLabel}
      </span>
    );
  }

  return (
    <motion.div
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={{
        initial: {
          color: 'white',
          textDecorationLine: underline ? 'underline' : 'none',
          textDecorationColor: '#39ff14',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px'
        },
        hover: {
          color: 'white',
          textDecorationLine: 'underline',
          textDecorationColor: '#39ff14',
          textDecorationThickness: '2px',
          textUnderlineOffset: '3px',
          transition: { duration: 0.2 }
        },
        tap: {
          opacity: 0.8,
          transition: { duration: 0.1 }
        }
      }}
      style={{
        fontSize: '20px',
        lineHeight: '24px',
        letterSpacing: '0.6px',
        whiteSpace: 'pre-line',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
      }}
    >
      <Link 
        href={href} 
        onClick={handleClick}
        style={{ 
          color: 'inherit',
          textDecoration: 'inherit',
          textDecorationColor: 'inherit',
          textDecorationThickness: 'inherit',
          textUnderlineOffset: 'inherit'
        }}
      >
        {formattedLabel}
      </Link>
    </motion.div>
  );
}
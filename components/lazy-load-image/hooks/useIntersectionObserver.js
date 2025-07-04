import { useEffect, useState } from 'react';

export const useIntersectionObserver = (containerRef) => {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    // Create an intersection observer to detect when the image is in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [containerRef]);

  return isInView;
}; 
'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

/**
 * A simple portal component for rendering content into a specified DOM node
 */
export default function Portal({ children, show = true }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  if (!mounted || !show) return null;
  
  return ReactDOM.createPortal(
    children,
    document.getElementById('portal-root')
  );
}
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FontTester from './FontTester';

export default function TrialSection({ variants, activeTab, isNavigatingHome, fontSettings }) {
  return (
    <AnimatePresence mode="wait">
      {!isNavigatingHome && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: [0.25, 0.1, 0.25, 1]
            }
          }}
        >
          <FontTester 
            activeTab={activeTab} 
            variants={variants} 
            fontSettings={fontSettings}
            isNavigatingHome={isNavigatingHome}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
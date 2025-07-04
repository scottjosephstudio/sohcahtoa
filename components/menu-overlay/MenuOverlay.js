'use client';

import { Fragment } from 'react';
import { AnimatePresence } from 'framer-motion';
import menuData from '../../data/menuData';

// Import styles and animations
import { Backdrop, Overlay, StudioName } from './styles/MenuOverlayStyles';
import { backdropVariants, overlayVariants, fadeInUp } from './styles/animationVariants';

// Import components
import ProjectsSection from './components/ProjectsSection';
import AboutSection from './components/AboutSection';
import ClientsSection from './components/ClientsSection';
import ContactSection from './components/ContactSection';
import FooterSection from './components/FooterSection';

// Import hooks
import { useMenuOverlayState } from './hooks/useMenuOverlayState';

export default function MenuOverlay({ $isOpen, onClose }) {
  const {
    isMounted,
    email,
    setEmail,
    isSubmitting,
    submitStatus,
    setSubmitStatus,
    errorMessage,
    setErrorMessage,
    isSupabaseConnected,
    overlayRef,
    handleNewsletterSubmit,
    handleLinkClick
  } = useMenuOverlayState($isOpen, onClose);

  // Only render the menu content on the client and prevent rendering during transitions
  if (!isMounted) {
    return (
      <AnimatePresence>
        {$isOpen && (
          <>
            <Backdrop 
              onClick={onClose} 
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
            <Overlay 
              $isOpen={$isOpen} 
              ref={overlayRef} 
              className="Overlay"
              initial={{ opacity: 0, visibility: "hidden" }}
              animate={{ opacity: 1, visibility: "visible", transition: { duration: 0.3, ease: "easeInOut" } }}
              exit={{ opacity: 0, visibility: "hidden", transition: { duration: 0.3, ease: "easeInOut" } }}
            />
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <AnimatePresence>
        {$isOpen && (
          <Backdrop 
            onClick={onClose} 
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {$isOpen && (
          <Overlay 
            ref={overlayRef} 
            className="Overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <StudioName
              variants={fadeInUp}
              custom={0}
            >
              {menuData.studioName}
            </StudioName>
            
            <ProjectsSection 
              sections={menuData.sections}
              handleLinkClick={handleLinkClick}
              onClose={onClose}
            />

            <AboutSection 
              aboutData={menuData.about}
              sectionsLength={menuData.sections.length}
            />

            <ClientsSection 
              selectedClients={menuData.selectedClients}
              sectionsLength={menuData.sections.length}
            />

            <ContactSection 
              contactData={menuData.contact}
              sectionsLength={menuData.sections.length}
              email={email}
              setEmail={setEmail}
              isSubmitting={isSubmitting}
              submitStatus={submitStatus}
              setSubmitStatus={setSubmitStatus}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              isSupabaseConnected={isSupabaseConnected}
              handleNewsletterSubmit={handleNewsletterSubmit}
            />

            <FooterSection 
              links={menuData.links}
              sectionsLength={menuData.sections.length}
              handleLinkClick={handleLinkClick}
              onClose={onClose}
            />
          </Overlay>
        )}
      </AnimatePresence>
    </>
  );
}

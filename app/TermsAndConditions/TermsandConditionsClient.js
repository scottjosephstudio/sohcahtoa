"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TransitionWrapper from '../../components/providers/TransitionWrapper';
import HomeIcon from '../../components/home-icon';
import NavigationArrows from '../../components/navigation-arrows';
import { 
  Container, 
  GridTCs, 
  DescriptionItem, 
  TechnologiesContainer, 
  ProjectDescription 
} from './components/TermsStyles';
import { descriptions, technologies } from './data/TermsContent';
import { useTermsState } from './hooks/useTermsState';

export default function TermsAndConditions() {
  const { isVisible, isSafari } = useTermsState();

  // Animation variants matching ProjectDescription
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        when: "afterChildren",
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0,
      // Remove Y transforms to prevent conflict with TransitionWrapper
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  return (
    <>
      <TransitionWrapper>
        <Container>
          <GridTCs>
            <div className="project-description">
              <AnimatePresence mode="wait">
                <ProjectDescription
                  key="project-description"
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  exit="exit"
                  variants={containerVariants}
                >
                  <div className="background-wrapper">
                    {isSafari ? (
                      // Safari-specific rendering with staggered fade in - matches ProjectDescription exactly
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={containerVariants}
                      >
                        <div className="safari-columns">
                          <div className="safari-column">
                            {descriptions.slice(0, Math.ceil(descriptions.length / 2)).map((item, index) => {
                              const uniqueKey = `${index}-${item.content.substring(0, 20)}`;
                                
                              if (item.className === 'title') {
                                return (
                                    <motion.div 
                                      key={uniqueKey}
                                    className="title"
                                      variants={itemVariants}
                                  >
                                    {item.content}
                                    </motion.div>
                                );
                              }
                              return (
                                  <motion.p 
                                    key={uniqueKey}
                                  dangerouslySetInnerHTML={{ __html: item.content }}
                                    variants={itemVariants}
                                />
                              );
                            })}
                          </div>
                          {descriptions.length > 1 && (
                            <div className="safari-column">
                              {descriptions.slice(Math.ceil(descriptions.length / 2)).map((item, index) => {
                                const uniqueKey = `${Math.ceil(descriptions.length / 2) + index}-${item.content.substring(0, 20)}`;
                                
                                if (item.className === 'title') {
                                  return (
                                    <motion.div 
                                      key={uniqueKey}
                                      className="title"
                                      variants={itemVariants}
                                    >
                                      {item.content}
                                    </motion.div>
                                  );
                                }
                                return (
                                  <motion.p 
                                    key={uniqueKey}
                                    dangerouslySetInnerHTML={{ __html: item.content }}
                                    variants={itemVariants}
                                  />
                                );
                              })}
                            </div>
                          )}
                      </div>
                      </motion.div>
                    ) : (
                      // Non-Safari rendering with staggered animations - matches ProjectDescription exactly
                      <>
                        <motion.div 
                          className="content"
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={containerVariants}
                        >
                        {descriptions.map((item, index) => {
                          const uniqueKey = `${index}-${item.content.substring(0, 20)}`;
                          
                          // Add extra margin-top for 'How information is shared' title only on non-Safari
                          const isHowInfoSharedTitle = item.className === 'title' && item.content === 'How information is shared';
                          const extraClass = isHowInfoSharedTitle ? 'before-shared-info-nonsafari' : '';
                          return (
                            <DescriptionItem 
                              key={uniqueKey}
                              variants={itemVariants}
                              className={extraClass}
                            >
                              {item.className === 'title' ? (
                                <div className="title">{item.content}</div>
                              ) : (
                                <p dangerouslySetInnerHTML={{ __html: item.content }} />
                              )}
                            </DescriptionItem>
                          );
                        })}
                        </motion.div>
                      </>
                    )}
                    
                    <TechnologiesContainer variants={itemVariants}>
                      <div className="technologies">
                        {technologies.map((tech, index) => (
                          <span key={index} className="technology-tag">{tech}</span>
                        ))}
                      </div>
                    </TechnologiesContainer>
                  </div>
                </ProjectDescription>
              </AnimatePresence>
            </div>
          </GridTCs>
        </Container>
      </TransitionWrapper>
      
      {/* Navigation components outside TransitionWrapper to avoid transform inheritance */}
      <HomeIcon />
      <NavigationArrows />
    </>
  );
}
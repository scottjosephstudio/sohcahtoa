"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import menuData from "../../data/menuData";
import { useNavigation } from "../../context/NavigationContext";

// Import components
import NavigationLink from "./components/NavigationLink";
import FooterLinks from "./components/FooterLinks";
import ContactNewsletter from "./components/ContactNewsletter";

// Import styles
import {
  MenuContainer,
  MenuPill,
  MenuItem,
  MenuItemCollapsed,
  DirectLink,
  MenuBridge,
  DropdownContainer,
  Dropdown,
  DropdownContent,
  ScrollWrapper,
  SectionTitle,
  ClientsTitle,
  ClientsGrid,
  ClientInfo,
  ClientLocation,
  ProjectList,
  ProjectItem,
  Backdrop,
  StaggeredContent,
} from "./styles/MenuStyles";

// Import animation variants
import {
  menuItemVariants,
  directLinkVariants,
  backdropVariants,
  dropdownVariants,
  contentVariants,
} from "./styles/animationVariants";

// Import hooks and utilities
import { usePortal, useMenuOverlay } from "./hooks/useMenuState";
import { getSafeUrl } from "./utils/urlUtils";

export default function Menu() {
  const pathname = usePathname();
  const { previousPath, $isNavigating } = useNavigation();

  // Completely hide menu from /ID path and font-specific paths - no rendering at all
  if (pathname === "/ID" || (pathname && pathname.startsWith("/Typefaces/") && pathname !== "/Typefaces")) {
    return null;
  }

  // Move ALL useState calls before any conditional returns
  const [isHovering, setIsHovering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullyExpanded, setIsFullyExpanded] = useState(false);
  const [lockDropdown, setLockDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScrolledOut, setIsScrolledOut] = useState(false);
  const [shouldShowMenu, setShouldShowMenu] = useState(true);
  const menuRef = useRef(null);
  const dropdownRef = useRef(null);
  const lastScrollPosition = useRef(0);

  // Handle menu fade animations for /Typefaces ↔ /ID navigation
  const [shouldFadeIn, setShouldFadeIn] = useState(false);

  useEffect(() => {
    // Since /ID is handled by early return, this only handles fade-in logic
    setShouldShowMenu(true);
    // Set fade in effect only when coming from /ID
    setShouldFadeIn(previousPath === "/ID");
  }, [pathname, previousPath]);

  // Mock the portal context for now
  const { isModalOpen, isTypefacesPath } = usePortal();
  const { openDropdown, setOpenDropdown } = useMenuOverlay();

  // Use useCallback for all functions used in useEffect dependencies
  const handleDropdownClose = useCallback(() => {
    setOpenDropdown(null);

    // Keep expanded state if still hovering the menu
    if (!isHovering) {
      setTimeout(() => {
        setIsExpanded(false);
      }, 200);
    }
  }, [isHovering, setOpenDropdown]);

  // Animation variants for framer-motion
  const fadeIn = {
    hidden: {
      opacity: 0,
      transform: "translateZ(0)",
    },
    visible: {
      opacity: 1,
      transform: "translateZ(0)",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transform: "translateZ(0)",
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  const createMenuItems = () => [
    {
      id: "projects",
      label: "Projects",
      href: "/projects",
      hasDropdown: true,
      content: () => (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DropdownContent className="DropdownContent">
            {menuData.sections.map((section, sectionIndex) => (
              <StaggeredContent
                key={section.title}
                $delay={0.1 + sectionIndex * 0.15}
              >
                <div>
                  <SectionTitle>{section.title}</SectionTitle>
                  <ProjectList>
                    {section.items.map((item) => {
                      const baseProjectId = item.link.split("/").pop();
                      const safeProjectId = getSafeUrl(baseProjectId);

                      return (
                        <ProjectItem key={item.name}>
                          <NavigationLink
                            href={`/Projects/${safeProjectId}`}
                            label={item.name}
                          />
                        </ProjectItem>
                      );
                    })}
                  </ProjectList>
                </div>
              </StaggeredContent>
            ))}
          </DropdownContent>
        </motion.div>
      ),
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      hasDropdown: true,
      content: () => {
        const paragraphs = menuData.about.content.split("\n\n");
        return (
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DropdownContent className="DropdownContent">
              <StaggeredContent $delay={0.1}>
                <SectionTitle>About</SectionTitle>
              </StaggeredContent>
              {paragraphs.map((paragraph, index) => (
                <StaggeredContent key={index} $delay={0.15 + index * 0.05}>
                  <p>{paragraph}</p>
                </StaggeredContent>
              ))}
              <StaggeredContent $delay={0.2 + paragraphs.length * 0.05}>
                <ClientsTitle>Selected Clients</ClientsTitle>
              </StaggeredContent>
              <ClientsGrid>
                {menuData.selectedClients.map((client, index) => (
                  <div key={client.name}>
                    <StaggeredContent
                      $delay={0.25 + paragraphs.length * 0.05 + index * 0.05}
                    >
                      <ClientInfo>
                        —&ensp;
                        {client.name}
                        <br />
                        <ClientLocation>{client.location}</ClientLocation>
                      </ClientInfo>
                    </StaggeredContent>
                  </div>
                ))}
              </ClientsGrid>
            </DropdownContent>
          </motion.div>
        );
      },
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
      hasDropdown: true,
      content: () => (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <DropdownContent className="DropdownContent">
            <StaggeredContent $delay={0.1}>
              <SectionTitle>Contact</SectionTitle>
            </StaggeredContent>
            <StaggeredContent $delay={0.15}>
              <div>
                <p>{menuData.contact.address.street}</p>
                <p>{menuData.contact.address.studio}</p>
                <p>{menuData.contact.address.city}</p>
                <p>{menuData.contact.address.postcode}</p>
                <p style={{ marginTop: "12px" }}>{menuData.contact.email}</p>
                <p>{menuData.contact.phone}</p>
              </div>
            </StaggeredContent>
            <StaggeredContent $delay={0.2}>
              <ContactNewsletter onClose={() => handleDropdownClose()} />
            </StaggeredContent>
            <StaggeredContent $delay={0.25}>
              <FooterLinks links={menuData.links} />
            </StaggeredContent>
          </DropdownContent>
        </motion.div>
      ),
    },
    {
      id: "Typefaces",
      label: "Typefaces",
      href: "/Typefaces",
      hasDropdown: false,
    },
  ];

  // Initialize menu items
  const menuItems = createMenuItems();

  // Scroll event listener for expanded menu animation
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollDiff = currentScroll - lastScrollPosition.current;

      // Only trigger if the menu is expanded but no dropdown is open
      if (isExpanded && !openDropdown) {
        if (scrollDiff > 0 && currentScroll > 50) {
          // Scrolling down past 50px threshold
          setIsScrolledOut(true);
        } else if (scrollDiff < 0) {
          // Scrolling up
          setIsScrolledOut(false);
        }
      }

      lastScrollPosition.current = currentScroll;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isExpanded, openDropdown]);

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      // If any part of the menu is active, initiate collapse sequence
      if (isExpanded || openDropdown || isHovering) {
        // If dropdown is open, use the proper close handler to trigger animations
        if (openDropdown) {
          handleDropdownClose();
        } else {
          // If just the menu is expanded, collapse it
          setIsExpanded(false);
          setIsFullyExpanded(false);
          setIsHovering(false);
        }

        // Clear any locks immediately
        setLockDropdown(false);
        setIsSubmitting(false);
        setIsScrolledOut(false); // Reset scroll state on resize
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isExpanded, openDropdown, isHovering, handleDropdownClose]);

  useEffect(() => {
    // When isExpanded becomes true, set a timeout to mark fully expanded
    if (isExpanded) {
      const timer = setTimeout(() => {
        setIsFullyExpanded(true);
      }, 350); // Slightly longer than the animation duration
      return () => clearTimeout(timer);
    } else {
      setIsFullyExpanded(false);
    }
  }, [isExpanded]);

  useEffect(() => {
    if (openDropdown) {
      // Apply body lock when dropdown opens
      document.body.classList.add("dropdown-open");
      // Ensure body stays locked by directly applying inline style
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Compensate for scrollbar width
    } else {
      // Remove all locking when dropdown closes
      document.body.classList.remove("dropdown-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Cleanup function to ensure locks are removed when component unmounts
    return () => {
      document.body.classList.remove("dropdown-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [openDropdown]);

  // Also add this useEffect to reset body lock when route changes
  useEffect(() => {
    // Reset body lock and dropdown state when pathname changes (page navigation)
    setOpenDropdown(null);
    document.body.classList.remove("dropdown-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  }, [pathname, setOpenDropdown]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        if (openDropdown) {
          handleDropdownClose();
        }
        setIsHovering(false);
        setTimeout(() => {
          if (!isHovering) {
            setIsExpanded(false);
          }
        }, 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown, isHovering, handleDropdownClose]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        if (openDropdown) {
          handleDropdownClose();
        }
        setIsHovering(false);
        setTimeout(() => {
          if (!isHovering) {
            setIsExpanded(false);
          }
        }, 200);
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [openDropdown, isHovering, handleDropdownClose]);

  const handleMouseEnter = () => {
    if (!lockDropdown && !isSubmitting) {
      setIsHovering(true);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setTimeout(() => {
      if (!isHovering && !openDropdown) {
        setIsExpanded(false);
      }
    }, 200);
  };

  const handleClick = (dropdown) => {
    if (isFullyExpanded && !lockDropdown && !isSubmitting) {
      if (openDropdown === dropdown) {
        handleDropdownClose();
      } else {
        setOpenDropdown(dropdown);
      }
    }
  };

  const handleNewsletterSubmissionStart = () => {
    setIsSubmitting(true);
    setLockDropdown(true);
  };

  const renderDirectItem = (item) => {
    if (item.hasDropdown) {
      return null;
    } else {
      return (
        <DirectLink
          key={item.id}
          href={item.href}
          variants={directLinkVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
        >
          {item.label}
        </DirectLink>
      );
    }
  };

  return (
    <>
      <AnimatePresence>
        {openDropdown && (
          <Backdrop
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shouldShowMenu && (
          <MenuContainer
            key="menu-container"
            style={{
              zIndex: isModalOpen && isTypefacesPath ? 40 : 100,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
            }}
          >
            <MenuPill
              ref={menuRef}
              className="menu-pill"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              $isExpanded={isExpanded}
              animate={{
                opacity: shouldShowMenu ? 1 : 0,
                y: isScrolledOut ? -100 : 0,
              }}
              initial={{
                opacity: shouldFadeIn ? 0 : 1,
                y: 0,
              }}
              transition={{
                opacity: shouldFadeIn
                  ? { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
                  : { duration: 0.15 },
                y: { duration: 0.15 },
              }}
              onAnimationComplete={() => {
                if (isExpanded) {
                  setIsFullyExpanded(true);
                } else {
                  setIsFullyExpanded(false);
                }
              }}
            >
              <AnimatePresence mode="wait">
                {!isExpanded ? (
                  <MenuItemCollapsed
                    key="menu-label"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        duration: 0.001,
                        delay: 0.001,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.1,
                      },
                    }}
                  >
                    Menu
                  </MenuItemCollapsed>
                ) : (
                  <motion.div
                    key="menu-items"
                    className="menu-items-container"
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      minWidth: "84px",
                      width: "100%",
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{
                      opacity: 0,
                      transition: {
                        duration: 0.01, // Make menu items container disappear instantly
                      },
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2,
                    }}
                  >
                    {menuItems.map((item, index) => {
                      if (item.hasDropdown) {
                        return (
                          <MenuItem
                            key={item.id}
                            variants={menuItemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onMouseEnter={() => {
                              if (
                                isFullyExpanded &&
                                !lockDropdown &&
                                !isSubmitting
                              ) {
                                setIsHovering(true);
                                setOpenDropdown(item.id);
                              }
                            }}
                            onClick={() => {
                              if (isFullyExpanded) {
                                handleClick(item.id);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (
                                (e.key === "Enter" || e.key === " ") &&
                                isFullyExpanded &&
                                !lockDropdown &&
                                !isSubmitting
                              ) {
                                e.preventDefault();
                                handleClick(item.id);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-haspopup="true"
                            aria-expanded={openDropdown === item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                              opacity: 0,
                              transition: {
                                duration: 0.01,
                                delay: 0,
                              },
                            }}
                            transition={{
                              duration: 0.2,
                              delay: 0.15 + index * 0.1,
                            }}
                          >
                            {item.label}
                          </MenuItem>
                        );
                      } else {
                        return (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{
                              opacity: 0,
                              transition: {
                                duration: 0.01, // Instant disappearance
                                delay: 0, // No delay
                              },
                            }}
                            transition={{
                              duration: 0.2,
                              delay: 0.15 + index * 0.1,
                            }}
                          >
                            {renderDirectItem(item)}
                          </motion.div>
                        );
                      }
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </MenuPill>

            <MenuBridge />

            <DropdownContainer $isOpen={!!openDropdown}>
              <AnimatePresence mode="wait">
                {openDropdown && (
                  <Dropdown
                    key={`dropdown-${openDropdown}`}
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onMouseEnter={() => {
                      setIsHovering(true);
                      setIsExpanded(true);
                    }}
                    onMouseLeave={() => {
                      setIsHovering(false);
                      setTimeout(() => {
                        if (!isHovering) {
                          handleDropdownClose();
                        }
                      }, 200);
                    }}
                    ref={dropdownRef}
                  >
                    <AnimatePresence mode="wait">
                      <ScrollWrapper
                        key={`content-${openDropdown}`}
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                      >
                        {menuItems
                          .find((item) => item.id === openDropdown)
                          ?.content()}
                      </ScrollWrapper>
                    </AnimatePresence>
                  </Dropdown>
                )}
              </AnimatePresence>
            </DropdownContainer>
          </MenuContainer>
        )}
      </AnimatePresence>
    </>
  );
}

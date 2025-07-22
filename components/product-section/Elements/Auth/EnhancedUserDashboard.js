import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import Portal from "../../../providers/Portal";
import { usePortal } from "../../../../context/PortalContext";
import styled from "styled-components";
import { fontDownloadService } from "../../../../lib/database/fontService";
import {
  UserDashboard as UserDashboardContainer,
  LoginModalOverlay as BaseOverlay,
  DashboardContent,
  ContentWrapper,
  DashboardHeader,
  DashboardGrid,
  FormRow,
  FormGroup,
  ModalTitleUserDashboard,
  CloseButton,
  LogoutButton,
  Section,
  UserInfoSection,
  ListItem,
  PriceText,
  DownloadButton,
  StyledHR,
  InputDashboard,
  SectionTitle,
  SectionTitleBilling,
  AddressSection,
  NewsletterSection,
  CheckboxLabel,
  CheckboxText,
  Checkbox,
  SaveButton,
  DashboardModalHeader,
  DashboardLabel,
  InputWrapper,
  dashboardVariants,
  contentVariants,
  headerElementsVariants,
  downloadButtonVariants,
  logoutButtonVariants,
  inputVariants,
  dashboardCheckboxVariants,
  saveButtonVariants,
} from "../../Controller/ProductPage_Styles";

// Enhanced overlay without backdrop filter if not on Typefaces path
const EnhancedOverlay = styled(BaseOverlay)`
  backdrop-filter: ${(props) =>
    props.$isTypefacesPath ? "blur(6px)" : "none"};
  -webkit-backdrop-filter: ${(props) =>
    props.$isTypefacesPath ? "blur(6px)" : "none"};
  background-color: rgba(211, 211, 211, 0.5);
  z-index: ${(props) => props.$zIndex};
`;


// Animated loading component with egg timer
const AnimatedLoading = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  color: #666;
`;

const EggTimerSVG = styled(motion.svg)`
  width: 30px;
  height: 20px;
  flex-shrink: 0;
`;

// Egg timer animation variants - gestalt sand flow with spin
const eggTimerVariants = {
  initial: { 
    rotate: 0,
    scale: 1
  },
  animate: { 
    rotate: 360, // 360-degree spin
    scale: [1, 1.05, 1],
    transition: {
      rotate: {
        duration: 3,
        repeat: Infinity,
        ease: "linear"
      },
      scale: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
};


const EnhancedUserDashboard = ({
  userEmail,
  setUserEmail,
  billingDetails,
  setBillingDetails,
  newsletter,
  setNewsletter,
  isEditMode,
  setIsEditMode,
  handleSaveChanges,
  handleLogout,
  handleModalClick,
  setIsLoginModalOpen,
  $isSaving,
  userId,
  currentUser,
}) => {
  const [userName, setUserName] = useState({ first: '', last: '' });
  const dbData = currentUser?.dbData || {};
  const userMeta = currentUser?.user_metadata || {};
  const firstName = dbData.first_name || userMeta.first_name || '';
  const lastName = dbData.last_name || userMeta.last_name || '';
  console.log('Dashboard derived names:', firstName, lastName);
  console.log('Dashboard userName state:', userName);
  console.log('Dashboard props:', 'firstName:', firstName, 'lastName:', lastName);
  console.log('🔍 Dashboard received:', {
    billingDetails,
    userId,
    userEmail
  });

  // Enhanced state for purchase history
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadHistory, setDownloadHistory] = useState({});

  // Add refs to track data fetching and prevent unnecessary calls
  const lastFetchedUserId = useRef(null);
  const isCurrentlyFetching = useRef(false);
  const dataCache = useRef(null);
  const mountTime = useRef(Date.now());

  // Use the portal context
  const { setIsModalOpen, isTypefacesPath, zIndex } = usePortal();

  // Update modal state on mount/unmount
  useEffect(() => {
    setIsModalOpen(true);
    document.body.classList.add('dashboard-open');
    return () => {
      setIsModalOpen(false);
      document.body.classList.remove('dashboard-open');
    };
  }, [setIsModalOpen]);

  // Track userId changes
  useEffect(() => {
    console.log('🔍 DASHBOARD userId CHANGED:', {
      userId,
      isLoading,
      hasCache: !!dataCache.current,
      lastFetchedUserId: lastFetchedUserId.current
    });
  }, [userId, isLoading]);

  // Enhanced data fetching with caching and race condition prevention
  const fetchUserData = useCallback(async (forceRefresh = false) => {
    console.log('🔍 FETCH USER DATA CALLED:', {
      userId,
      forceRefresh,
      isCurrentlyFetching: isCurrentlyFetching.current,
      lastFetchedUserId: lastFetchedUserId.current,
      hasCache: !!dataCache.current,
      cacheAge: dataCache.current ? Date.now() - dataCache.current.timestamp : 'no cache'
    });
    
    if (!userId) {
      console.log("⚠️ No userId provided, skipping data fetch");
      setIsLoading(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (isCurrentlyFetching.current && !forceRefresh) {
      console.log("🔄 Data fetch already in progress, skipping...");
      return;
    }

    // Set fetching flag
    isCurrentlyFetching.current = true;
    
    try {
      // Check if we already have cached data for this user
      if (dataCache.current && 
          dataCache.current.userId === userId && 
          !forceRefresh && 
          Date.now() - dataCache.current.timestamp < 60000) { // 1 minute cache
        console.log("📦 Using cached data for user:", userId);
        setPurchases(dataCache.current.purchases);
        setDownloadHistory(dataCache.current.downloadHistory);
        setIsLoading(false);
        return;
      }

      console.log("🔄 Fetching fresh data for user:", userId);
      setIsLoading(true);
      
      // Fetch user data from the database
      const response = await fetch('/api/user-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User data fetched successfully:", data);
      console.log("📊 Raw API response structure:", {
        userExists: !!data.user,
        userLicensesCount: data.userLicenses?.length || 0,
        purchaseOrdersCount: data.purchaseOrders?.length || 0,
        purchaseOrdersData: data.purchaseOrders
      });

      // Handle the new API response structure
      const { user, userLicenses, purchaseOrders } = data;
      
      // Transform purchaseOrders to match the expected structure
      const transformedPurchases = [];
      (purchaseOrders || []).forEach(order => {
        (order.purchase_items || []).forEach(item => {
          // Find the corresponding user license for this purchase item
          const userLicense = (userLicenses || []).find(license => 
            license.purchase_item_id === item.id
          );
          
          transformedPurchases.push({
            id: `${order.id}-${item.id}`,
            order_id: order.id,
            purchase_item_id: item.id,
            user_license_id: userLicense?.id,
                    font_style_id: item.font_style_id,
                    font_styles: item.font_styles,
                    purchase_items: [{
              ...item,
              purchase_orders: [order]
            }],
                        created_at: order.created_at,
            total_price_cents: item.total_price_cents
          });
                  });
                });
      
      // Update purchase history with transformed data
      setPurchases(transformedPurchases);
      
      // Update billing details from user data
      if (user && setBillingDetails) {
        const newBillingDetails = {
          street: user.street_address || '',
          city: user.city || '',
          postcode: user.postal_code || '',
          country: user.country || ''
        };
        
        console.log('📋 Dashboard: About to call setBillingDetails with:', newBillingDetails);
        console.log('📋 Dashboard: setBillingDetails function type:', typeof setBillingDetails);
        
        setBillingDetails(newBillingDetails);
        console.log('📋 Dashboard: setBillingDetails called successfully');
        
        // Trigger a refresh of the main auth state billing details
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('refreshBillingDetails'));
          console.log('📋 Dashboard: refreshBillingDetails event dispatched');
        }
      } else {
        console.log('⚠️ Dashboard: Cannot update billing details - user or setBillingDetails not available:', {
          hasUser: !!user,
          hasSetBillingDetails: !!setBillingDetails,
          userData: user
        });
      }
      
      // Initialize download history from user licenses
      const newDownloadHistory = {};
      (userLicenses || []).forEach(license => {
        newDownloadHistory[license.id] = license.download_count || 0;
      });
      setDownloadHistory(newDownloadHistory);
      
      if (user) {
        console.log('👤 Setting user name from API data:', {
          first_name: user.first_name,
          last_name: user.last_name,
          full_user: user
        });
        setUserName({
          first: user.first_name || '',
          last: user.last_name || ''
        });
      }


      // Cache the data
      dataCache.current = {
        userId,
        purchases: transformedPurchases,
        userLicenses: userLicenses || [],
        downloadHistory: newDownloadHistory,
        timestamp: Date.now()
      };
      
      lastFetchedUserId.current = userId;
      console.log("💾 Data cached successfully for user:", userId);
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      setPurchases([]);
      setDownloadHistory({});
    } finally {
      setIsLoading(false);
      isCurrentlyFetching.current = false; // Always reset the flag
    }
  }, [userId]);

  // Enhanced useEffect with better dependency management
  useEffect(() => {
    console.log('🔄 Dashboard useEffect triggered with userId:', userId);
    console.log('📊 Current state:', {
      userId,
      lastFetchedUserId: lastFetchedUserId.current,
      hasCache: !!dataCache.current,
      isLoading
    });
    
    // Prevent duplicate processing for the same userId
    if (userId && userId === lastFetchedUserId.current && dataCache.current && !isLoading) {
      console.log('📦 Using cached data for userId:', userId);
      return;
    }
    
    // Only fetch if userId has changed or we don't have cached data
    if (userId && (userId !== lastFetchedUserId.current || !dataCache.current)) {
      console.log('✅ Fetching user data for userId:', userId);
    fetchUserData();
    } else if (!userId) {
      console.log('⚠️ No userId provided, clearing data');
      // Clear data if no user
      setPurchases([]);
      setIsLoading(false);
    }
  }, [userId, isLoading]); // Add isLoading to dependencies for better state tracking

  // Add a method to force refresh data (useful for after purchases)
  const refreshUserData = useCallback(() => {
    fetchUserData(true);
  }, []); // Remove fetchUserData dependency to prevent recreation loops

  // Expose refresh method via a custom event
  useEffect(() => {
    const handleRefreshRequest = () => {
      refreshUserData();
    };

    window.addEventListener('refreshUserDashboard', handleRefreshRequest);
    return () => window.removeEventListener('refreshUserDashboard', handleRefreshRequest);
  }, [refreshUserData]);

  // Enhanced download functionality
  const handleDownload = async (userLicenseId, fontStyleId, format) => {
    try {
      const result = await fontDownloadService.downloadFont(
        userLicenseId,
        fontStyleId,
        format
      );

      if (result.success) {
        // Update download history
        setDownloadHistory(prev => ({
          ...prev,
          [`${userLicenseId}-${fontStyleId}-${format}`]: new Date().toISOString()
        }));
      } else {
        console.error("Download failed:", result.error);
      }
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const formatPrice = (cents) => {
    // Handle undefined, null, or NaN values
    if (cents === undefined || cents === null || isNaN(cents)) {
      return '$0.00';
    }
    return `$${(cents / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAvailableFormats = (fontFiles) => {
    // fontFiles is a JSONB object like {"woff2": "path/to/file.woff2", "woff": "path/to/file.woff"}
    // We need to extract the keys (format names)
    if (!fontFiles || typeof fontFiles !== 'object') {
      return ['woff2', 'woff', 'ttf', 'otf']; // Default formats if no data
    }
    
    try {
      const formats = Object.keys(fontFiles).filter(Boolean);
      return formats.length > 0 ? formats : ['woff2', 'woff', 'ttf', 'otf']; // Fallback to default formats
    } catch (error) {
      console.error('Error processing font files:', error);
      return ['woff2', 'woff', 'ttf', 'otf']; // Fallback on error
    }
  };

  const handleClose = () => {
    if (setIsLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  };

  // Loading component with sand timer
  const LoadingIndicator = () => (
    <AnimatedLoading>
      <EggTimerSVG
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="initial"
        animate="animate"
        variants={eggTimerVariants}
      >
        {/* Top triangle - solid, fat, dark grey */}
        <path
          d="M6 2L18 2L12 10L6 2Z"
          fill="#444"
          opacity="0.8"
        />
        
        {/* Bottom triangle - solid, fat, dark grey (mirrored) */}
        <path
          d="M6 22L18 22L12 14L6 22Z"
          fill="#444"
          opacity="0.8"
        />
        
        {/* Animated sand particles flowing through center */}
        <motion.circle
          cx="12"
          cy="12"
          r="0.4"
          fill="#444"
          opacity="0.8"
          initial={{ cy: 10, opacity: 0, scale: 0 }}
          animate={{ 
            cy: [10, 14], 
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0
          }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="0.3"
          fill="#444"
          opacity="0.6"
          initial={{ cy: 10, opacity: 0, scale: 0 }}
          animate={{ 
            cy: [10, 14], 
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.4
          }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="0.35"
          fill="#444"
          opacity="0.7"
          initial={{ cy: 10, opacity: 0, scale: 0 }}
          animate={{ 
            cy: [10, 14], 
            opacity: [0, 0.7, 0],
            scale: [0, 1, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.8
          }}
        />
      </EggTimerSVG>
    </AnimatedLoading>
  );

  const dashboardContent = (
    <>
      <EnhancedOverlay
        as={motion.div}
        onClick={handleClose}
        $isTypefacesPath={isTypefacesPath}
        $zIndex={zIndex.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{
          opacity: 0,
          transition: {
            duration: 0.2,
            ease: "easeInOut",
          },
        }}
      />

      <UserDashboardContainer
        className="user-dashboard"
        style={{ zIndex: zIndex.modal }}
        variants={dashboardVariants}
        initial="hidden"
        animate="visible"
        exit={{
          opacity: 0,
          scale: 1,
          transition: {
            opacity: { duration: 0.3, ease: "easeOut" },
            scale: { duration: 0.2, ease: "easeInOut" },
            when: "afterChildren",
          },
        }}
        onClick={handleModalClick}
      >
        <DashboardContent>
          <DashboardHeader
            variants={headerElementsVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
            <CloseButton
              onClick={() => setIsLoginModalOpen(false)}
              variants={headerElementsVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <svg
                id="a"
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 17.96 17.95"
                style={{ transform: "rotate(45deg)" }}
              >
                <path
                  d="M16.73,7.75h-6.53V1.23c0-.68-.55-1.23-1.22-1.23s-1.23.55-1.23,1.23v6.53H1.23c-.68,0-1.23.55-1.23,1.23s.55,1.23,1.23,1.23h6.53v6.53c0,.68.55,1.22,1.23,1.22s1.22-.55,1.22-1.22v-6.53h6.53c.68,0,1.22-.55,1.22-1.23s-.55-1.23-1.22-1.23Z"
                  fill="lime"
                  strokeWidth="0"
                />
              </svg>
            </CloseButton>

            <DashboardModalHeader>
              <ModalTitleUserDashboard>
                {(() => {
                  const nameDisplay = (userName.first || userName.last) ? ` — ${userName.first} ${userName.last}` : '';
                  console.log('🔍 Header rendering with:', { userName, nameDisplay });
                  return `Account Details${nameDisplay}`;
                })()}
              </ModalTitleUserDashboard>
          </DashboardModalHeader>

            <LogoutButton 
              key={`logout-${userId}`}
              onClick={handleLogout}
              variants={logoutButtonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="initial"
            >
              <span>Logout</span>
            </LogoutButton>
          </DashboardHeader>

            <ContentWrapper>
            <DashboardGrid
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <UserInfoSection
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SectionTitleBilling>Login Information</SectionTitleBilling>
                  <FormRow>
                  <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <FormGroup className="email-group">
                      <DashboardLabel>Email</DashboardLabel>
                        <InputDashboard
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          disabled={!isEditMode}
                        $isSaving={$isSaving}
                        variants={inputVariants}
                        initial="initial"
                        whileHover={!isEditMode ? undefined : "hover"}
                        whileFocus={!isEditMode ? undefined : "focus"}
                      />
                    </FormGroup>
                  </motion.div>
                </FormRow>

                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <AddressSection>
                    <SectionTitleBilling>Billing Address</SectionTitleBilling>

                    <FormRow>
                      <FormGroup className="street-address-group">
                        <DashboardLabel>Street Address</DashboardLabel>
                        <InputWrapper>
                          <InputDashboard
                            type="text"
                            value={billingDetails.street}
                            onChange={(e) =>
                              setBillingDetails((prev) => ({
                                ...prev,
                                street: e.target.value,
                              }))
                            }
                            placeholder="Enter your street address"
                            disabled={!isEditMode}
                            $isSaving={$isSaving}
                            variants={inputVariants}
                            initial="initial"
                            whileHover={!isEditMode ? undefined : "hover"}
                            whileFocus={!isEditMode ? undefined : "focus"}
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormGroup className="city-address-group">
                        <DashboardLabel>City</DashboardLabel>
                        <InputWrapper>
                          <InputDashboard
                            type="text"
                            value={billingDetails.city}
                            onChange={(e) =>
                              setBillingDetails((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            placeholder="Enter your town/city"
                            disabled={!isEditMode}
                            $isSaving={$isSaving}
                            variants={inputVariants}
                            initial="initial"
                            whileHover={!isEditMode ? undefined : "hover"}
                            whileFocus={!isEditMode ? undefined : "focus"}
                        />
                      </InputWrapper>
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                      <FormGroup className="postcode-group">
                        <DashboardLabel>Postal Code</DashboardLabel>
                        <InputWrapper>
                        <InputDashboard
                            type="text"
                            value={billingDetails.postcode}
                            onChange={(e) =>
                              setBillingDetails((prev) => ({
                                ...prev,
                                postcode: e.target.value,
                              }))
                            }
                            placeholder="Enter your postal zip/code"
                            disabled={!isEditMode}
                            $isSaving={$isSaving}
                          variants={inputVariants}
                            initial="initial"
                            whileHover={!isEditMode ? undefined : "hover"}
                            whileFocus={!isEditMode ? undefined : "focus"}
                          />
                        </InputWrapper>
                      </FormGroup>

                      <FormGroup className="country-group">
                        <DashboardLabel>Country</DashboardLabel>
                        <InputWrapper>
                          <InputDashboard
                            type="text"
                            value={billingDetails.country}
                            onChange={(e) =>
                              setBillingDetails((prev) => ({
                                ...prev,
                                country: e.target.value,
                              }))
                            }
                            placeholder="Enter your country"
                          disabled={!isEditMode}
                            $isSaving={$isSaving}
                            variants={inputVariants}
                            initial="initial"
                            whileHover={!isEditMode ? undefined : "hover"}
                            whileFocus={!isEditMode ? undefined : "focus"}
                          />
                        </InputWrapper>
                    </FormGroup>
                  </FormRow>
                  </AddressSection>
                </motion.div>

                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <NewsletterSection>
                    <CheckboxLabel
                      onMouseEnter={() => {
                        // Trigger checkbox hover when hovering label
                        if (isEditMode) {
                          // This will be handled by CSS hover in CheckboxLabel
                        }
                      }}
                    >
                      <Checkbox
                        type="checkbox"
                        checked={newsletter}
                        onChange={(e) => setNewsletter(e.target.checked)}
                        disabled={!isEditMode}
                        variants={dashboardCheckboxVariants}
                        initial="initial"
                        whileHover={
                          isEditMode
                            ? newsletter
                              ? "checkedHover"
                              : "hover"
                            : "initial"
                        }
                        animate={newsletter ? "checked" : "initial"}
                        custom={{ isEditMode, checked: newsletter }}
                      />
                      <CheckboxText>Subscribe to newsletter</CheckboxText>
                    </CheckboxLabel>
                  </NewsletterSection>
                  <SaveButton
                    onClick={() => {
                      if (isEditMode) {
                        handleSaveChanges();
                      } else {
                        setIsEditMode(true);
                      }
                    }}
                    variants={saveButtonVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="hover"
                  >
                    {isEditMode ? "Save Changes" : "Edit Details"}
                  </SaveButton>
                </motion.div>
              </UserInfoSection>

              <div>
                <motion.div
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Section
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <SectionTitle>Purchase History</SectionTitle>
                    {isLoading ? (
                      <>
                        <ListItem>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LoadingIndicator />
                          </div>
                        </ListItem>
                        <StyledHR />
                      </>
                    ) : purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <div key={purchase.id}>
                          <ListItem style={{ padding: '12px 0' }}>
                            <span>
                              {purchase.font_styles?.font_families?.name || "Unknown Font"} — {purchase.font_styles?.name || "Unknown Style"}
                            </span>
                            <PriceText>{formatPrice(purchase.purchase_items?.[0]?.total_price_cents || 0)}</PriceText>
                          </ListItem>
                          {purchase.purchase_items?.[0]?.purchase_orders?.[0]?.usage_type && (
                            <ListItem style={{ padding: '12px 0' }}>
                              <span style={{ fontSize: '20px', color: '#666', opacity: 1 }}>
                                Usage: {purchase.purchase_items?.[0]?.purchase_orders?.[0]?.usage_type}
                              </span>
                              <span style={{ fontSize: '20px', color: '#666', opacity: 1 }}>
                                {formatDate(purchase.purchase_items?.[0]?.purchase_orders?.[0]?.created_at)}
                              </span>
                            </ListItem>
                          )}
                          <StyledHR style={{ marginBottom: '12px' }} />
                        </div>
                      ))
                    ) : (
                      <>
                        <ListItem>
                          <span>No purchases. Please make a purchase.</span>
                        </ListItem>
                        <StyledHR />
                      </>
                    )}
                </Section>

                  <Section
                    variants={contentVariants}
                          initial="hidden"
                          animate="visible"
                    exit="exit"
                  >
                    <SectionTitle>Available Typeface Downloads</SectionTitle>
                    {isLoading ? (
                      <>
                        <ListItem>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <LoadingIndicator />
                          </div>
                        </ListItem>
                        <StyledHR />
                      </>
                    ) : purchases.length > 0 ? (
                      purchases.map((purchase) => {
                        const fontFiles = purchase.font_styles?.font_files || {};
                        const availableFormats = getAvailableFormats(fontFiles);
                        
                        return availableFormats.map((format) => (
                          <div key={`${purchase.id}-${format}`}>
                            <ListItem>
                              <span>
                                {purchase.font_styles?.font_families?.name || "Unknown"}.{format}
                              </span>
                              <DownloadButton
                                      variants={downloadButtonVariants}
                                initial="initial"
                                whileHover="hover"
                                      onClick={() => handleDownload(
                                  purchase.user_license_id,
                                  purchase.font_style_id,
                                        format
                                      )}
                                    >
                                <span>Download</span>
                              </DownloadButton>
                            </ListItem>
                            <StyledHR />
                          </div>
                        ));
                      })
                    ) : (
                      <>
                        <ListItem>
                          <span>
                            No available downloads. Please make a purchase in
                            order to download a typeface.
                          </span>
                        </ListItem>
                        <StyledHR />
                      </>
                    )}
                  </Section>
                </motion.div>
              </div>
              </DashboardGrid>
            </ContentWrapper>
          </DashboardContent>
        </UserDashboardContainer>
    </>
  );

  // Use the Portal component to render into the portal-root div
  return <Portal>{dashboardContent}</Portal>;
};

export default EnhancedUserDashboard; 
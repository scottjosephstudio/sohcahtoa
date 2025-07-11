import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import Portal from "../../../providers/Portal";
import { usePortal } from "../../../../context/PortalContext";
import styled from "styled-components";
import { supabase } from "../../../../lib/database/supabaseClient";
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

// Enhanced styled components for purchase history
const PurchaseHistorySection = styled(Section)`
  grid-column: 1 / -1;
  margin-top: 24px;
`;

const PurchaseItem = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid rgb(16, 12, 8);
  border-radius: 10px;
  margin-bottom: 16px;
  background: #f9f9f9;
`;

const PurchaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
`;

const OrderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const OrderNumber = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: rgb(16, 12, 8);
  letter-spacing: 0.6px;
`;

const OrderDate = styled.span`
  font-size: 12px;
  color: rgb(16, 12, 8);
  opacity: 0.7;
`;

const OrderTotal = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: rgb(16, 12, 8);
  letter-spacing: 0.8px;
`;

const FontItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-top: 1px solid rgba(16, 12, 8, 0.1);
  
  &:first-child {
    border-top: none;
    padding-top: 0;
  }
`;

const FontInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FontName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: rgb(16, 12, 8);
`;

const LicenseInfo = styled.span`
  font-size: 12px;
  color: rgb(16, 12, 8);
  opacity: 0.7;
`;

const DownloadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const FormatButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FormatButton = styled(motion.button)`
  padding: 6px 12px;
  border: 1px solid rgb(16, 12, 8);
  border-radius: 6px;
  background: transparent;
  color: rgb(16, 12, 8);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(16, 12, 8);
    color: #f9f9f9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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
}) => {
  // Enhanced state for purchase history
  const [purchases, setPurchases] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadHistory, setDownloadHistory] = useState({});

  // Use the portal context
  const { setIsModalOpen, isTypefacesPath, zIndex } = usePortal();

  // Update modal state on mount/unmount
  useEffect(() => {
    setIsModalOpen(true);
    return () => setIsModalOpen(false);
  }, [setIsModalOpen]);

  // Enhanced data fetching
  const fetchUserData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // First, get the database user ID from the auth user ID
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_user_id", userId)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        setIsLoading(false);
        return;
      }

      if (userData) {
        const user = userData;
        const databaseUserId = user.id; // This is the database user ID we need
        
        setUserEmail(user.email || "");
        setBillingDetails({
          street: user.street_address || "",
          city: user.city || "",
          postcode: user.postal_code || "",
          country: user.country || "",
        });
        setNewsletter(user.newsletter_subscription || false);

        // Now fetch purchase history using the database user ID
      const { data: purchaseData, error: purchaseError } = await supabase
          .from("purchase_orders")
        .select(`
          *,
            purchase_items (
              id,
              font_style_id,
              license_type,
              license_package_id,
              custom_licenses,
              unit_price_cents,
              total_price_cents,
          font_styles (
            id,
            name,
            slug,
            font_files,
            font_families (
              id,
              name,
              slug
            )
              )
            )
          `)
          .eq("user_id", databaseUserId)
        .order("created_at", { ascending: false });

        if (purchaseError) {
          console.error("Error fetching purchase data:", purchaseError);
          setIsLoading(false);
          return;
        } else {
          // Transform the data to match the expected format
          const transformedData = [];
          
          if (purchaseData) {
            // Also fetch user licenses for download functionality
            const { data: userLicenses, error: licensesError } = await supabase
              .from("user_licenses")
              .select("id, purchase_item_id, font_style_id")
              .eq("user_id", databaseUserId);

            if (licensesError) {
              console.error("Error fetching user licenses:", licensesError);
            }

            // Create a map of purchase_item_id to user_license_id
            const licenseMap = {};
            if (userLicenses) {
              userLicenses.forEach(license => {
                licenseMap[license.purchase_item_id] = license.id;
              });
            }
            
            purchaseData.forEach(order => {
              if (order.purchase_items) {
                order.purchase_items.forEach(item => {
                  transformedData.push({
                    id: item.id,
                    font_style_id: item.font_style_id,
                    user_license_id: licenseMap[item.id], // Add user license ID for downloads
                    font_styles: item.font_styles,
                    purchase_items: [{
                      id: item.id,
                      total_price_cents: item.total_price_cents,
                      unit_price_cents: item.unit_price_cents,
                      purchase_orders: [{
                        id: order.id,
                        order_number: order.order_number,
                        created_at: order.created_at,
                        total_cents: order.total_cents
                      }]
                    }]
                  });
                });
              }
            });
          }
          
          setPurchases(transformedData);
          console.log("✅ Fetched purchase data:", transformedData?.length || 0, "items");
          // Debug: Log the actual data structure
          if (transformedData && transformedData.length > 0) {
            console.log("📊 Purchase data structure:", JSON.stringify(transformedData[0], null, 2));
          }
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", {
        message: error?.message || 'Unknown error',
        details: error?.details || 'No details available',
        hint: error?.hint || 'No hint available',
        code: error?.code || 'No error code',
        userId: userId
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

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
              <ModalTitleUserDashboard>Account Details</ModalTitleUserDashboard>
          </DashboardModalHeader>

            <LogoutButton 
              onClick={handleLogout}
              variants={logoutButtonVariants}
              initial="initial"
              whileHover="hover"
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
                    <CheckboxLabel>
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
                        custom={{ isEditMode }}
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
                      <ListItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
                          <span>Loading...</span>
                        </div>
                      </ListItem>
                    ) : purchases.length > 0 ? (
                      purchases.map((purchase) => (
                        <div key={purchase.id}>
                          <ListItem>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span>
                                {purchase.font_styles?.font_families?.name || "Unknown Font"} — {purchase.font_styles?.name || "Unknown Style"}
                              </span>
                              <span style={{ fontSize: '16px', color: '#666', opacity: 0.8 }}>
                                {formatDate(purchase.purchase_items?.[0]?.purchase_orders?.[0]?.created_at)}
                              </span>
                            </div>
                            <PriceText>{formatPrice(purchase.purchase_items?.[0]?.total_price_cents || 0)}</PriceText>
                          </ListItem>
                          <StyledHR />
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
                      <ListItem>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '30px' }}>
                          <span>Loading...</span>
                        </div>
                      </ListItem>
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
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "../../../providers/Portal";
import { usePortal } from "../../../../context/PortalContext";
import styled from "styled-components";
import { 
  getUserLicenses, 
  getUserPurchases, 
  getUserDownloads,
  fontDownloadService 
} from "../../../../lib/database/supabaseClient";
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
  ModalHeader,
  DashboardModalHeader,
  DashboardLabel,
  InputWrapper,
  PasswordContainer,
  TogglePasswordButton,
  dashboardVariants,
  contentVariants,
  headerElementsVariants,
  downloadButtonVariants,
  inputVariants,
  checkboxVariants,
  dashboardCheckboxVariants,
  saveButtonVariants,
  togglePasswordVariants,
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

// New styled components for enhanced functionality
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

const DownloadHistory = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(16, 12, 8, 0.1);
`;

const DownloadHistoryTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: rgb(16, 12, 8);
  margin-bottom: 12px;
  letter-spacing: 0.6px;
`;

const DownloadRecord = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 12px;
  color: rgb(16, 12, 8);
  opacity: 0.7;
`;

const LoadingSpinner = styled(motion.div)`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(16, 12, 8, 0.1);
  border-top: 2px solid rgb(16, 12, 8);
  border-radius: 50%;
  margin: 20px auto;
`;

const ErrorMessage = styled.div`
  color: #ff0000;
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: rgb(16, 12, 8);
  opacity: 0.6;
`;

// Animation variants
const purchaseItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const EnhancedUserDashboard = ({
  userEmail,
  setUserEmail,
  userPassword,
  setUserPassword,
  showPassword,
  setShowPassword,
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
  userId, // Add userId prop
}) => {
  // Use the portal context
  const { setIsModalOpen, isTypefacesPath, zIndex } = usePortal();
  
  // State for purchase data
  const [purchases, setPurchases] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingFormats, setDownloadingFormats] = useState(new Set());

  // Update modal state on mount/unmount
  useEffect(() => {
    setIsModalOpen(true);
    return () => setIsModalOpen(false);
  }, [setIsModalOpen]);

  // Load user data when dashboard opens
  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load purchases, licenses, and download history in parallel
      const [purchasesResult, licensesResult, downloadsResult] = await Promise.all([
        getUserPurchases(userId),
        getUserLicenses(userId),
        getUserDownloads(userId)
      ]);

      if (purchasesResult.error) {
        throw new Error('Failed to load purchases: ' + purchasesResult.error.message);
      }

      if (licensesResult.error) {
        throw new Error('Failed to load licenses: ' + licensesResult.error.message);
      }

      if (downloadsResult.error) {
        throw new Error('Failed to load downloads: ' + downloadsResult.error.message);
      }

      setPurchases(purchasesResult.data || []);
      setLicenses(licensesResult.data || []);
      setDownloads(downloadsResult.data || []);

    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (setIsLoginModalOpen) {
      setIsLoginModalOpen(false);
    }
  };

  const handleDownload = async (userLicenseId, fontStyleId, format) => {
    try {
      const downloadKey = `${userLicenseId}-${format}`;
      setDownloadingFormats(prev => new Set([...prev, downloadKey]));

      // Get client info
      const clientInfo = {
        ip_address: 'client', // This would be populated server-side
        user_agent: navigator.userAgent
      };

      // Generate download link
      const result = await fontDownloadService.generateDownloadLink(
        userId,
        userLicenseId,
        fontStyleId,
        format,
        clientInfo
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      // Trigger download
      const link = document.createElement('a');
      link.href = result.data.download_url;
      link.download = ''; // Let the server set the filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Refresh download history
      await loadUserData();

    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download font: ' + err.message);
    } finally {
      const downloadKey = `${userLicenseId}-${format}`;
      setDownloadingFormats(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  const formatPrice = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLicenseDescription = (license) => {
    const purchaseItem = license.purchase_items;
    if (purchaseItem.license_type === 'package') {
      return `${purchaseItem.license_package_id} Package License`;
    } else if (purchaseItem.license_type === 'custom') {
      const customLicenses = purchaseItem.custom_licenses;
      return Object.keys(customLicenses).join(', ') + ' Custom License';
    }
    return 'License';
  };

  const getAvailableFormats = (fontStyle) => {
    if (!fontStyle?.font_files) return [];
    return Object.keys(fontStyle.font_files);
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

            <LogoutButton onClick={handleLogout}>
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
              {/* Account Information Section */}
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
                        animate={isEditMode ? "enabled" : "disabled"}
                        whileHover={isEditMode ? "hover" : {}}
                      />
                    </FormGroup>
                  </motion.div>
                </FormRow>

                <FormRow>
                  <motion.div
                    variants={contentVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <FormGroup className="password-group">
                      <DashboardLabel>Password</DashboardLabel>
                      <PasswordContainer>
                        <InputDashboard
                          type={showPassword ? "text" : "password"}
                          value={userPassword}
                          onChange={(e) => setUserPassword(e.target.value)}
                          disabled={!isEditMode}
                          $isSaving={$isSaving}
                          variants={inputVariants}
                          initial="initial"
                          animate={isEditMode ? "enabled" : "disabled"}
                          whileHover={isEditMode ? "hover" : {}}
                        />
                        <TogglePasswordButton
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          variants={togglePasswordVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                          disabled={!isEditMode}
                        >
                          {showPassword ? "Hide" : "Show"}
                        </TogglePasswordButton>
                      </PasswordContainer>
                    </FormGroup>
                  </motion.div>
                </FormRow>
              </UserInfoSection>

              {/* Purchase History Section */}
              <PurchaseHistorySection
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <SectionTitle>Purchase History & Downloads</SectionTitle>
                
                {loading && (
                  <LoadingSpinner
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                )}

                {error && (
                  <ErrorMessage>{error}</ErrorMessage>
                )}

                {!loading && !error && purchases.length === 0 && (
                  <EmptyState>
                    No purchases found. Visit the typefaces page to purchase fonts.
                  </EmptyState>
                )}

                {!loading && !error && purchases.length > 0 && (
                  <AnimatePresence>
                    {purchases.map((purchase) => (
                      <PurchaseItem
                        key={purchase.id}
                        variants={purchaseItemVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <PurchaseHeader>
                          <OrderInfo>
                            <OrderNumber>Order #{purchase.order_number}</OrderNumber>
                            <OrderDate>{formatDate(purchase.created_at)}</OrderDate>
                          </OrderInfo>
                          <OrderTotal>{formatPrice(purchase.total_cents)}</OrderTotal>
                        </PurchaseHeader>

                        {purchase.purchase_items?.map((item) => {
                          // Find corresponding license
                          const userLicense = licenses.find(
                            license => license.purchase_item_id === item.id
                          );

                          return (
                            <FontItem key={item.id}>
                              <FontInfo>
                                <FontName>
                                  {item.font_styles?.font_families?.name} - {item.font_styles?.name}
                                </FontName>
                                <LicenseInfo>
                                  {getLicenseDescription(userLicense)}
                                </LicenseInfo>
                              </FontInfo>

                              {userLicense && (
                                <DownloadSection>
                                  <FormatButtons>
                                    {getAvailableFormats(item.font_styles).map((format) => {
                                      const downloadKey = `${userLicense.id}-${format}`;
                                      const isDownloading = downloadingFormats.has(downloadKey);
                                      
                                      return (
                                        <FormatButton
                                          key={format}
                                          onClick={() => handleDownload(
                                            userLicense.id,
                                            item.font_style_id,
                                            format
                                          )}
                                          disabled={isDownloading}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          {isDownloading ? '...' : format.toUpperCase()}
                                        </FormatButton>
                                      );
                                    })}
                                  </FormatButtons>
                                </DownloadSection>
                              )}
                            </FontItem>
                          );
                        })}
                      </PurchaseItem>
                    ))}
                  </AnimatePresence>
                )}

                {/* Download History */}
                {downloads.length > 0 && (
                  <DownloadHistory>
                    <DownloadHistoryTitle>Recent Downloads</DownloadHistoryTitle>
                    {downloads.slice(0, 10).map((download) => (
                      <DownloadRecord key={download.id}>
                        <span>
                          {download.font_styles?.font_families?.name} - {download.font_styles?.name} 
                          ({download.file_format.toUpperCase()})
                        </span>
                        <span>{formatDate(download.downloaded_at)}</span>
                      </DownloadRecord>
                    ))}
                  </DownloadHistory>
                )}
              </PurchaseHistorySection>
            </DashboardGrid>
          </ContentWrapper>
        </DashboardContent>
      </UserDashboardContainer>
    </>
  );

  return <Portal>{dashboardContent}</Portal>;
};

export default EnhancedUserDashboard; 
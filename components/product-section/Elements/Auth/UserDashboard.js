import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Portal from '../../../providers/Portal';
import { usePortal } from '../../../../context/PortalContext';
import styled from 'styled-components';
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
    togglePasswordVariants
} from '../../Controller/ProductPage_Styles';

// Enhanced overlay without backdrop filter if not on Typefaces path
const EnhancedOverlay = styled(BaseOverlay)`
  /* Remove backdrop-filter on non-Typefaces paths to prevent blurring portal content */
  backdrop-filter: ${props => props.$isTypefacesPath ? 'blur(6px)' : 'none'};
  -webkit-backdrop-filter: ${props => props.$isTypefacesPath ? 'blur(6px)' : 'none'};
  /* The background stays, just no blur */
  background-color: rgba(211, 211, 211, 0.5);
  z-index: ${props => props.$zIndex};
`;

const UserDashboard = ({
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
    hasPurchases = false
}) => {
    // Use the portal context
    const { setIsModalOpen, isTypefacesPath, zIndex } = usePortal();
    
    // Update modal state on mount/unmount
    useEffect(() => {
      setIsModalOpen(true);
      return () => setIsModalOpen(false);
    }, [setIsModalOpen]);
    
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
              ease: "easeInOut"
            }
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
                    when: "afterChildren"
                }
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
                              style={{ transform: 'rotate(45deg)' }}
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

                    <LogoutButton onClick={handleLogout}><span>Logout</span></LogoutButton>
                </DashboardHeader>

                <ContentWrapper>
                    <DashboardGrid variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                        <UserInfoSection variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                        <SectionTitleBilling>Login Information</SectionTitleBilling>
                          <FormRow>

                                <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
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

                                <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                    <FormGroup className="password-group">
                                        <DashboardLabel>Password</DashboardLabel>
                                        <PasswordContainer>
                                            <InputDashboard
                                                type={showPassword ? "text" : "password"}
                                                value={userPassword}
                                                onChange={(e) => setUserPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                disabled={!isEditMode}
                                                $isSaving={$isSaving}
                                                variants={inputVariants}
                                                initial="initial"
                                                whileHover={!isEditMode ? undefined : "hover"}
                                                whileFocus={!isEditMode ? undefined : "focus"}
                                            />
                                            <TogglePasswordButton
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                disabled={!isEditMode}
                                                variants={togglePasswordVariants}
                                                initial="initial"
                                                whileHover={!isEditMode ? undefined : "hover"}
                                            >
                                                {showPassword ? 'Hide' : 'Show'}
                                            </TogglePasswordButton>
                                        </PasswordContainer>
                                    </FormGroup>
                                </motion.div>
                            </FormRow>

                            <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                <AddressSection>
                                    <SectionTitleBilling>Billing Address</SectionTitleBilling>

                                    <FormRow>
                                        <FormGroup className="street-address-group">
                                            <DashboardLabel>Street Address</DashboardLabel>
                                            <InputWrapper>
                                                <InputDashboard 
                                                    type="text" 
                                                    value={billingDetails.street}
                                                    onChange={(e) => setBillingDetails(prev => ({
                                                        ...prev,
                                                        street: e.target.value
                                                    }))}
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
                                                    onChange={(e) => setBillingDetails(prev => ({
                                                        ...prev,
                                                        city: e.target.value
                                                    }))}
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
                                                    onChange={(e) => setBillingDetails(prev => ({
                                                        ...prev,
                                                        postcode: e.target.value
                                                    }))}
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
                                                    onChange={(e) => setBillingDetails(prev => ({
                                                        ...prev,
                                                        country: e.target.value
                                                    }))}
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

                            <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                <NewsletterSection>
                                    <CheckboxLabel>
                                        <Checkbox
                                            type="checkbox"
                                            checked={newsletter}
                                            onChange={(e) => setNewsletter(e.target.checked)}
                                            disabled={!isEditMode}
                                            variants={dashboardCheckboxVariants}
                                            initial="initial"
                                            whileHover={isEditMode ? (newsletter ? "checkedHover" : "hover") : "initial"}
                                            animate={newsletter ? "checked" : "initial"}
                                            custom={{ isEditMode }}
                                        />
                                        <CheckboxText>Subscribe to newsletter</CheckboxText>
                                    </CheckboxLabel>
                                </NewsletterSection>
                                <SaveButton 
                                    onClick={handleSaveChanges}
                                    variants={saveButtonVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap="hover"
                                >
                                    {isEditMode ? 'Save Changes' : 'Edit Details'}
                                </SaveButton>
                            </motion.div>
                        </UserInfoSection>

                        <div>
                            <motion.div variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                <Section variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                    <SectionTitle>Purchase History</SectionTitle>
                                    {hasPurchases ? (
                                        <>
                                            <ListItem>
                                                <span>Soh-Cah-Toa — Display</span>
                                                <PriceText>$30.00</PriceText>
                                            </ListItem>
                                            <StyledHR />
                                        </>
                                    ) : (
                                        <>
                                            <ListItem>
                                                <span>No purchases. Please make a purchase.</span>
                                            </ListItem>
                                            <StyledHR />
                                        </>
                                    )}
                                </Section>

                                <Section variants={contentVariants} initial="hidden" animate="visible" exit="exit">
                                    <SectionTitle>Available Typeface Downloads</SectionTitle>
                                    {hasPurchases ? (
                                        <>
                                            <ListItem>
                                                <span>Soh-Cah-Toa.otf</span>
                                                <DownloadButton
                                                    variants={downloadButtonVariants}
                                                    initial="initial"
                                                    whileHover="hover"
                                                >
                                                    Download
                                                </DownloadButton>
                                            </ListItem>
                                            <ListItem>
                                                <span>Soh-Cah-Toa.woff</span>
                                                <DownloadButton
                                                    variants={downloadButtonVariants}
                                                    initial="initial"
                                                    whileHover="hover"
                                                >
                                                    Download
                                                </DownloadButton>
                                            </ListItem>
                                            <StyledHR />
                                        </>
                                    ) : (
                                        <>
                                            <ListItem>
                                                <span>No available downloads. Please make a purchase in order to download a typeface.</span>
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

export default UserDashboard;
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { LICENSE_TYPES, packages, licenseOptions } from '../Constants/constants';
import {
  SummarySection,
  SummaryHeader,
  SummaryContentContainer,
  FixedTotalSection,
  StyleDetail,
  PriceDetail,
  LicenseDetail,
  LicenseDetailContainer,
  TotalPrice,
  RemoveLink,
  AddLicenseLink,
  PlaceholderText,
  Button as CheckoutButton,
  SummaryItem,
  OptionHeader,
  summaryContentVariants,
  addLicenseLinkVariants,
  buttonVariants
} from '../styles';

const TotalSectionWrapper = styled(motion.div)`
  @media (min-width: 769px) {
    margin-top: 24px;
  }
`;

const StyledFixedTotalSection = styled(FixedTotalSection)`
  @media (min-width: 769px) {
    margin-top: 0;
  }
`;

const CartSummary = ({
  weightOption,
  selectedPackage,
  customizing,
  customLicenses,
  onRemoveStyle,
  onRemoveLicense,
  onRemovePackage,
  onAddLicense,
  showPaymentForm,
  selectedPaymentMethod,
  isStripeFormComplete,
  isCheckoutDisabled,
  onPayment,
  onProceed,
  isProcessing,
  totalSectionRef,
  currentStage,
  showUsageSelection,
  showRegistration,
  isMobileLayout,
  hasSelections,
  isLoadingPayment,
}) => {
  const getActiveLicenses = () => {
    const { customPrintLicense, customWebLicense, customAppLicense, customSocialLicense } = customLicenses;
    return [
      { type: 'print', value: customPrintLicense },
      { type: 'web', value: customWebLicense },
      { type: 'app', value: customAppLicense },
      { type: 'social', value: customSocialLicense }
    ].filter(license => license.value !== null);
  };

  const getLicenseTypeDisplay = (type) => {
    return LICENSE_TYPES[type]?.displayName || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getLicenseDetails = (type, value) => {
    const optionsKey = LICENSE_TYPES[type].optionsKey;
    return licenseOptions[optionsKey][value];
  };

  const calculateCustomTotal = () => {
    return getActiveLicenses().reduce((total, license) => 
      total + getLicenseDetails(license.type, license.value).price, 0);
  };

  const handlePaymentClick = () => {
    if (showPaymentForm && onPayment) {
      onPayment();
    } else {
      onProceed();
    }
  };

  const isButtonDisabled = showPaymentForm 
    ? selectedPaymentMethod === 'card' 
      ? !isStripeFormComplete || isProcessing
      : !selectedPaymentMethod 
    : isCheckoutDisabled;

  const totalAmount = selectedPackage 
    ? packages[selectedPackage].price 
    : calculateCustomTotal();
    
  const hasContent = !!selectedPackage || (customizing && getActiveLicenses().length > 0);

  // Create a unified key that represents the current license state and stage
  const getLicenseStateKey = () => {
    const stageKey = `stage-${currentStage || 1}`;
    
    if (selectedPackage) {
      return `${stageKey}-package-${selectedPackage}`;
    }
    if (customizing && getActiveLicenses().length > 0) {
      return `${stageKey}-custom-${getActiveLicenses().map(l => `${l.type}-${l.value}`).join('-')}`;
    }
    return `${stageKey}-placeholder`;
  };

  return (
    <AnimatePresence mode="wait">
      <SummarySection 
        as={motion.div}
        key={`summary-${currentStage || 1}`}
        variants={summaryContentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        $showTotal={hasContent}
        $isMobile={isMobileLayout}
      >
        <SummaryHeader>
          <motion.div>
            <OptionHeader>Summary</OptionHeader>
          </motion.div>
        </SummaryHeader>

        <SummaryContentContainer $showTotal={hasContent}>
          {weightOption && (
            <StyleDetail>
              <LicenseDetail>Soh Cah Toa Display</LicenseDetail>
              <RemoveLink onClick={onRemoveStyle}><span>Remove</span></RemoveLink>
            </StyleDetail>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={getLicenseStateKey()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {selectedPackage ? (
                <SummaryItem>
                  <PriceDetail>
                    <span>{selectedPackage.charAt(0).toUpperCase() + selectedPackage.slice(1)}</span>
                    <span>${packages[selectedPackage].price}.00</span>
                  </PriceDetail>
                  <LicenseDetailContainer>
                    <div>
                      {Object.entries(packages[selectedPackage])
                        .filter(([key]) => key !== 'price')
                        .map(([key, value]) => (
                          <LicenseDetail key={`${selectedPackage}-${key}-${value}`}>
                            — {key.charAt(0).toUpperCase() + key.slice(1)} Licence {value}
                          </LicenseDetail>
                        ))}
                    </div>
                    <RemoveLink onClick={onRemovePackage}><span>Remove</span></RemoveLink>
                  </LicenseDetailContainer>
                </SummaryItem>
              ) : customizing && getActiveLicenses().length > 0 ? (
                <>
                  {getActiveLicenses().map((license) => {
                    const licenseDetails = getLicenseDetails(license.type, license.value);
                    return (
                      <SummaryItem key={`license-${license.type}-${license.value}`}>
                        <PriceDetail>
                          <span>{licenseDetails.name}</span>
                          <span>${licenseDetails.price}.00</span>
                        </PriceDetail>
                        <LicenseDetailContainer>
                          <div>
                            <LicenseDetail>
                              — {getLicenseTypeDisplay(license.type)} Licence {licenseDetails.limit}
                            </LicenseDetail>
                          </div>
                          <RemoveLink onClick={() => onRemoveLicense(license.type)}>
                            <span>Remove</span>
                          </RemoveLink>
                        </LicenseDetailContainer>
                      </SummaryItem>
                    );
                  })}
                </>
              ) : (
                <PlaceholderText $hasStyle={!!weightOption}>
                  Specify Licence
                </PlaceholderText>
              )}

              {customizing && getActiveLicenses().length > 0 && (
                <AddLicenseLink 
                  onClick={onAddLicense}
                  variants={addLicenseLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  + Add Another Licence
                </AddLicenseLink>
              )}
            </motion.div>
          </AnimatePresence>
        </SummaryContentContainer>
        
        <AnimatePresence>
          {hasContent && (
            <TotalSectionWrapper
              initial={{ opacity: 0, height: 0, overflow: "hidden" }}
              animate={{ 
                opacity: 1, 
                height: "auto",
                transition: {
                  opacity: { duration: 0.3, ease: "easeInOut" },
                  height: { duration: 0.4, ease: "easeInOut" }
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                transition: {
                  opacity: { duration: 0.2, ease: "easeInOut" },
                  height: { duration: 0.3, ease: "easeInOut" }
                }
              }}
            >
              <StyledFixedTotalSection ref={totalSectionRef}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`total-${totalAmount}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <TotalPrice>
                      <span>Total</span>
                      <span>${totalAmount}.00</span>
                    </TotalPrice>
                  </motion.div>
                </AnimatePresence>
                <CheckoutButton
                  disabled={isButtonDisabled}
                  onClick={handlePaymentClick}
                  variants={buttonVariants}
                  initial="initial"
                  animate={isButtonDisabled ? "disabled" : "enabled"}
                  whileHover={isButtonDisabled ? {} : "hover"}
                  whileTap={isButtonDisabled ? {} : "hover"}
                >
                  {showPaymentForm 
                    ? (isProcessing ? 'Processing...' : 'Complete Payment') 
                    : 'Proceed'}
                </CheckoutButton>
              </StyledFixedTotalSection>
            </TotalSectionWrapper>
          )}
        </AnimatePresence>
      </SummarySection>
    </AnimatePresence>
  );
};

export default CartSummary;
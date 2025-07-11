import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled from "styled-components";
import {
  LICENSE_TYPES,
  packages,
  licenseOptions,
} from "../Constants/constants";
import { calculateMultiFontPrice } from "../Utils/multiFontPricing";
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
  buttonVariants,
  removeLinkVariants,
} from "../styles";
import { useCart } from "../Utils/CartContext";

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

const FontListItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0px 0;
  border-bottom: 1px solid rgba(16, 12, 8, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const FontDetails = styled.div`
  flex: 1;
`;

const FontName = styled.div`
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
`;

const FontStyles = styled.div`
  font-size: 20px;
  letter-spacing: 0.8px;
  color: rgba(16, 12, 8, 0.6);
`;

const FontPrice = styled.div`
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.8px;
  text-align: right;
`;

const CartSummary = ({
  weightOption,
  selectedPackage,
  customizing,
  customLicenses,
  onRemoveStyle,
  onRemoveLicense,
  onRemovePackage,
  onRemoveFont,
  onAddLicense,
  showPaymentForm,
  selectedPaymentMethod,
  isStripeFormComplete,
  isCheckoutDisabled,
  onProceed,
  onPayment,
  isProcessing,
  totalSectionRef,
  currentStage,
  showUsageSelection,
  showRegistration,
  isMobileLayout,
  hasSelections,
  isLoadingPayment,
}) => {
  const { 
    selectedFonts, 
    selectedStyles, 
    selectedFontIds,
    calculateTotalPrice, 
    getPricingBreakdownData 
  } = useCart();

  const getActiveLicenses = () => {
    const {
      customPrintLicense,
      customWebLicense,
      customAppLicense,
      customSocialLicense,
    } = customLicenses;
    return [
      { type: "print", value: customPrintLicense },
      { type: "web", value: customWebLicense },
      { type: "app", value: customAppLicense },
      { type: "social", value: customSocialLicense },
    ].filter((license) => license.value !== null);
  };

  const getLicenseTypeDisplay = (type) => {
    return (
      LICENSE_TYPES[type]?.displayName ||
      type.charAt(0).toUpperCase() + type.slice(1)
    );
  };

  const getLicenseDetails = (type, value) => {
    const optionsKey = LICENSE_TYPES[type].optionsKey;
    return licenseOptions[optionsKey][value];
  };

  const calculateCustomTotal = () => {
    return getActiveLicenses().reduce(
      (total, license) =>
        total + getLicenseDetails(license.type, license.value).price,
      0,
    );
  };

  const handlePaymentClick = () => {
    if (showPaymentForm && onPayment) {
      // Use the payment processor for payment processing
      onPayment();
    } else {
      // Use the regular proceed function for other stages
      onProceed();
    }
  };

  const isButtonDisabled = showPaymentForm
    ? selectedPaymentMethod === "card"
      ? !isStripeFormComplete || isProcessing
      : !selectedPaymentMethod
    : isCheckoutDisabled;

  // Use new multi-font pricing calculation
  const totalAmount = calculateTotalPrice();
  const pricingBreakdown = getPricingBreakdownData();

  const hasContent =
    !!selectedPackage || (customizing && getActiveLicenses().length > 0);

  // Create a unified key that represents the current license state and stage
  const getLicenseStateKey = () => {
    const stageKey = `stage-${currentStage || 1}`;

    if (selectedPackage) {
      return `${stageKey}-package-${selectedPackage}`;
    }
    if (customizing && getActiveLicenses().length > 0) {
      return `${stageKey}-custom-${getActiveLicenses()
        .map((l) => `${l.type}-${l.value}`)
        .join("-")}`;
    }
    return `${stageKey}-placeholder`;
  };

  // Get font display name for single font fallback
  const getFontDisplayName = () => {
    if (selectedFonts.length > 0) {
      const font = selectedFonts[0];
      const styles = selectedStyles[font.id] || [];
      if (styles.length > 0) {
        return `${font.name} ${styles[0].name}`;
      }
      return font.name;
    }
    return "Soh Cah Toa Display"; // Fallback
  };

  // Calculate individual custom license price for multi-font
  const getCustomLicensePrice = (licenseType, licenseValue) => {
    // Only count fonts that are actually selected (checked)
    const checkedFonts = selectedFonts.filter(font => selectedFontIds.has(font.id));
    
    if (checkedFonts.length === 0) {
      return getLicenseDetails(licenseType, licenseValue).price;
    }

    // Create a mock custom license object for this specific license
    const mockCustomLicense = {};
    mockCustomLicense[`custom${licenseType.charAt(0).toUpperCase() + licenseType.slice(1)}License`] = licenseValue;

    try {
      return calculateMultiFontPrice(
        checkedFonts,
        selectedStyles,
        "custom",
        null,
        mockCustomLicense
      );
    } catch (error) {
      console.error('Error calculating custom license price:', error);
      return getLicenseDetails(licenseType, licenseValue).price;
    }
  };

  // Get count of checked fonts for display
  const getCheckedFontCount = () => {
    return selectedFonts.filter(font => selectedFontIds.has(font.id)).length;
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
          {/* Individual font entries - each with its own remove button */}
          {selectedFonts.length > 0 ? (
            selectedFonts.map((font) => (
              <StyleDetail key={font.id}>
                <LicenseDetail>
                  {font.name} {(selectedStyles[font.id] || []).length > 1 ? `(${(selectedStyles[font.id] || []).length} styles)` : (selectedStyles[font.id] || [])[0]?.name || ''}
                </LicenseDetail>
                <RemoveLink 
                  onClick={() => onRemoveFont(font.id)}
                  variants={removeLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <span>Remove</span>
                </RemoveLink>
              </StyleDetail>
            ))
          ) : (
            // Show primary font if no multi-fonts selected
            weightOption && (
              <StyleDetail>
                <LicenseDetail>{getFontDisplayName()}</LicenseDetail>
                <RemoveLink 
                  onClick={onRemoveStyle}
                  variants={removeLinkVariants}
                  initial="initial"
                  whileHover="hover"
                >
                  <span>Remove</span>
                </RemoveLink>
              </StyleDetail>
            )
          )}

          {/* Multi-font pricing breakdown */}
          {selectedFonts.length > 1 && pricingBreakdown.fonts.length > 0 && 
           (selectedPackage || (customizing && getActiveLicenses().length > 0)) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1, 
                height: 'auto',
                transition: {
                  height: { duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] },
                  opacity: { duration: 0.3, delay: 0.1, ease: "easeOut" }
                }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                transition: {
                  height: { duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] },
                  opacity: { duration: 0.2, ease: "easeIn" }
                }
              }}
              style={{ overflow: 'hidden', marginTop: "24px" }}
            >
              {pricingBreakdown.fonts.map((fontItem, index) => (
                <motion.div
                  key={fontItem.font.id}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: 0.3 + (index * 0.1),
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98]
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -5,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn"
                    }
                  }}
                >
                  <FontListItem>
                    <FontDetails>
                      <FontName>{fontItem.font.name}</FontName>
                      <FontStyles>
                        {fontItem.styles.length > 1 ? `(${fontItem.styles.length} styles)` : fontItem.styles[0]?.name || ''}
                      </FontStyles>
                    </FontDetails>
                    <FontPrice>${fontItem.totalPrice.toFixed(2)}</FontPrice>
                  </FontListItem>
                </motion.div>
              ))}
              {pricingBreakdown.fontMultiplier !== 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: {
                      delay: 0.3 + (pricingBreakdown.fonts.length * 0.1),
                      duration: 0.3,
                      ease: [0.04, 0.62, 0.23, 0.98]
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    y: -5,
                    transition: {
                      duration: 0.2,
                      ease: "easeIn"
                    }
                  }}
                >
                  <FontListItem>
                    <FontDetails>
                      <FontName>Multi-typeface discount</FontName>
                    </FontDetails>
                    <FontPrice>
                      –${Math.abs(pricingBreakdown.total - pricingBreakdown.subtotal).toFixed(2)}
                    </FontPrice>
                  </FontListItem>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Separator between breakdown and license total */}
          {selectedFonts.length > 1 && pricingBreakdown.fonts.length > 0 && 
           (selectedPackage || (customizing && getActiveLicenses().length > 0)) && (
            <div style={{ 
              borderTop: '2px solid rgb(16, 12, 8)', 
              marginTop: '18px', 
              marginBottom: '24px' 
            }} />
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={getLicenseStateKey()}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { duration: 0.3, ease: "easeInOut", delay: 0.2 }
              }}
              exit={{ 
                opacity: 0,
                transition: { duration: 0.2, ease: "easeInOut" }
              }}
            >
              {selectedPackage ? (
                <SummaryItem>
                  <PriceDetail>
                    <span>
                      {selectedPackage.charAt(0).toUpperCase() +
                        selectedPackage.slice(1)}
                      {getCheckedFontCount() > 1 && ` (${getCheckedFontCount()} typefaces)`}
                    </span>
                    <span>${totalAmount}.00</span>
                  </PriceDetail>
                  <LicenseDetailContainer>
                    <div>
                      {Object.entries(packages[selectedPackage])
                        .filter(([key]) => key !== "price" && !key.toLowerCase().includes("pricemultiplier"))
                        .map(([key, value]) => (
                          <LicenseDetail
                            key={`${selectedPackage}-${key}-${value}`}
                          >
                            — {key.charAt(0).toUpperCase() + key.slice(1)}{" "}
                            Licence {value}
                          </LicenseDetail>
                        ))}
                    </div>
                    <RemoveLink 
                      onClick={onRemovePackage}
                      variants={removeLinkVariants}
                      initial="initial"
                      whileHover="hover"
                    >
                      <span>Remove</span>
                    </RemoveLink>
                  </LicenseDetailContainer>
                </SummaryItem>
              ) : customizing && getActiveLicenses().length > 0 ? (
                <>
                  {getActiveLicenses().map((license) => {
                    const licenseDetails = getLicenseDetails(
                      license.type,
                      license.value,
                    );
                    const licensePrice = getCustomLicensePrice(license.type, license.value);
                    return (
                      <SummaryItem
                        key={`license-${license.type}-${license.value}`}
                      >
                        <PriceDetail>
                          <span>
                            {licenseDetails.name}
                            {getCheckedFontCount() > 1 && ` (${getCheckedFontCount()} typefaces)`}
                          </span>
                          <span>${licensePrice}.00</span>
                        </PriceDetail>
                        <LicenseDetailContainer>
                          <div>
                            <LicenseDetail>
                              — {getLicenseTypeDisplay(license.type)} Licence{" "}
                              {licenseDetails.limit}
                            </LicenseDetail>
                          </div>
                          <RemoveLink
                            onClick={() => onRemoveLicense(license.type)}
                            variants={removeLinkVariants}
                            initial="initial"
                            whileHover="hover"
                          >
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
                  height: { duration: 0.4, ease: "easeInOut" },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  opacity: { duration: 0.2, ease: "easeInOut" },
                  height: { duration: 0.3, ease: "easeInOut" },
                },
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
                    ? isProcessing
                      ? "Processing..."
                      : "Complete Payment"
                    : "Proceed"}
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

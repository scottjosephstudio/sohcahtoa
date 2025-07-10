import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LICENSE_TYPES,
  packages,
  licenseOptions,
} from "../Constants/constants";
import { useEqualHeight } from "../hooks/useEqualHeight";
import { useCart } from "../Utils/CartContext";
import { calculateMultiFontPrice } from "../Utils/multiFontPricing";
import {
  StepContainer,
  OptionHeader,
  PackageGrid,
  PackageCard,
  PackageTitle,
  LicenseDetail,
  AdditionalLicensingSection,
  CustomizeButton,
  ReachOutLink,
  packageCardVariants,
  buttonVariants,
} from "../styles";

export const LicenseSelection = ({
  isOpen,
  weightOption,
  selectedPackage,
  customizing,
  onPackageSelect,
  onCustomizeClick,
  customLicenses,
  onLicenseSelect,
}) => {
  const { containerRef } = useEqualHeight([customizing, customLicenses]);
  const { selectedFonts, selectedStyles, selectedFontIds } = useCart();

  if (!isOpen || !weightOption) return null;

  // Calculate multi-font pricing for each package
  const getPackagePrice = (packageKey) => {
    // Only count fonts that are actually selected (checked)
    const checkedFonts = selectedFonts.filter(font => selectedFontIds.has(font.id));
    
    if (checkedFonts.length === 0) {
      // Fallback to original single-font pricing
      return packages[packageKey].price;
    }

    try {
      return calculateMultiFontPrice(
        checkedFonts,
        selectedStyles,
        "package",
        packageKey,
        {}
      );
    } catch (error) {
      console.error('Error calculating package price:', error);
      return packages[packageKey].price;
    }
  };

  // Calculate multi-font pricing for custom licenses
  const getCustomLicensePrice = (licenseType, licenseKey) => {
    // Only count fonts that are actually selected (checked)
    const checkedFonts = selectedFonts.filter(font => selectedFontIds.has(font.id));
    
    if (checkedFonts.length === 0) {
      // Fallback to original single-font pricing
      return licenseOptions[licenseType][licenseKey].price;
    }

    // Create a mock custom license object for this specific license
    const mockCustomLicense = {};
    mockCustomLicense[`custom${licenseType.charAt(0).toUpperCase() + licenseType.slice(1)}License`] = licenseKey;

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
      return licenseOptions[licenseType][licenseKey].price;
    }
  };

  // Get the count of selected fonts for display
  const getSelectedFontCount = () => {
    return selectedFonts.filter(font => selectedFontIds.has(font.id)).length;
  };

  // Get font count text for display
  const getFontCountText = () => {
    const count = getSelectedFontCount();
    if (count <= 1) return "";
    return ` (${count} typefaces)`;
  };

  const renderCustomLicenseSection = () => {
    // Flatten all license options into direct cards like packages
    const allLicenseOptions = [];
    Object.entries(LICENSE_TYPES).forEach(([type, config]) => {
      Object.entries(licenseOptions[config.optionsKey]).forEach(
        ([key, option]) => {
          const currentValue =
            customLicenses[
              `custom${type.charAt(0).toUpperCase() + type.slice(1)}License`
            ];
          const isSelected = currentValue === key;

          allLicenseOptions.push({
            id: `${type}-${key}`,
            type,
            key,
            option,
            config,
            isSelected,
            displayName: `${config.displayName} ${option.name}`,
          });
        },
      );
    });

    return (
      <PackageGrid data-custom-license ref={containerRef}>
        {allLicenseOptions.map(
          ({ id, type, key, option, isSelected, displayName }) => (
            <PackageCard
              key={id}
              selected={isSelected}
              onClick={() => onLicenseSelect(type, key)}
              variants={packageCardVariants}
              initial="initial"
              whileHover="hover"
              animate={isSelected ? "selected" : "initial"}
            >
              <PackageTitle>
                <span>{displayName}{getFontCountText()}</span>
                <span>${getCustomLicensePrice(type, key)}.00</span>
              </PackageTitle>
              <LicenseDetail>— {option.limit}</LicenseDetail>
            </PackageCard>
          ),
        )}
      </PackageGrid>
    );
  };

  // The main content of the component
  const mainSection = (
    <StepContainer
      key="main-license-section"
      isLicenceOpen={isOpen}
      hasCustomSection={customizing}
      isPackageContainer={true}
    >
      <OptionHeader>Specify Licence</OptionHeader>
      <AnimatePresence mode="wait">
        {weightOption && (
          <motion.div
            key="licence-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <PackageGrid>
              {Object.entries(packages).map(([key, pkg]) => (
                <PackageCard
                  key={`package-${key}`}
                  selected={selectedPackage === key}
                  onClick={() => onPackageSelect(key)}
                  variants={packageCardVariants}
                  initial="initial"
                  whileHover="hover"
                  animate={selectedPackage === key ? "selected" : "initial"}
                >
                  <PackageTitle>
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}{getFontCountText()}</span>
                    <span>${getPackagePrice(key)}.00</span>
                  </PackageTitle>
                  <LicenseDetail>— Desktop Licence {pkg.print}</LicenseDetail>
                  <LicenseDetail>— Web Licence {pkg.web}</LicenseDetail>
                  <LicenseDetail>— App Licence {pkg.app}</LicenseDetail>
                  <LicenseDetail>
                    — Social Media Licence {pkg.social}
                  </LicenseDetail>
                </PackageCard>
              ))}
            </PackageGrid>

            <CustomizeButton
              onClick={onCustomizeClick}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="hover"
              transition={{ duration: 0.2 }}
            >
              {customizing ? "Cancel Custom Licence" : "Custom Licence?"}
            </CustomizeButton>
          </motion.div>
        )}
      </AnimatePresence>
    </StepContainer>
  );

  // Additional licensing section for standard view
  const additionalLicensingStandard = !customizing && weightOption && (
    <AdditionalLicensingSection key="additional-licensing">
      Need to unlock additional or speciality licencing options?&nbsp;
      <ReachOutLink href="mailto:info@example.com">Reach out</ReachOutLink> for
      consultation on: public realm, wayfinding and signage, packaging, business
      document systems, electronic device displays, logos/word-marks, campaign
      advertising, third party websites/software, out of home, e-publishing,
      TV/cinema, merchandising, POS and political and religious use.
    </AdditionalLicensingSection>
  );

  // Custom licensing section with smooth animation
  const customSection = customizing && (
    <React.Fragment key="custom-license-fragment">
      <StepContainer
        key="custom-license-section"
        isLicenceOpen={isOpen}
        hasCustomSection={customizing}
        isPackageContainer={true}
      >
        <OptionHeader>Custom Licence</OptionHeader>
        <AnimatePresence mode="wait">
          <motion.div
            key="custom-license-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderCustomLicenseSection()}
          </motion.div>
        </AnimatePresence>
      </StepContainer>

      <AdditionalLicensingSection key="custom-additional-licensing">
        Need to unlock additional or speciality licencing options?&nbsp;
        <ReachOutLink href="mailto:info@example.com">
          Reach out
        </ReachOutLink>{" "}
        for consultation on: public realm, wayfinding and signage, packaging,
        business document systems, electronic device displays, logos/word-marks,
        campaign advertising, third party websites/software, out of home,
        e-publishing, TV/cinema, merchandising, POS and political and religious
        use.
      </AdditionalLicensingSection>
    </React.Fragment>
  );

  // Render content based on the current state
  return (
    <React.Fragment>
      {mainSection}
      {additionalLicensingStandard}
      {customSection}
    </React.Fragment>
  );
};

export default LicenseSelection;
